// authenticated-only

const mongoose = require("mongoose");
const OrderModel = require("../models/order.js");
const CustomError = require("../error-handling/customError.js");
const sendApiResponse = require("../utils/apiResponse.js");
const CartModel = require("../models/cart.js");
const { getCartSummary, populateCart } = require('../utils/helpers/cart.js');
const { startOrderProcessing } = require("../queues/order.js");
const { addEmailToQueue } = require("../queues/email.js");
const { updateProductsOnCancellation, updateProductsOnDelivery } = require("../utils/helpers/product.js");
const razorpay = require("../configs/razorpay.js");
const crypto = require("crypto");
const { getRemainingDeliveryTime, reserveStock } = require("../utils/helpers/order.js");


// create new order
const createOrder = async (req, res, next) => {
    const { paymentMethod } = req.body;
    const shippingAddress = req.shippingAddress; // middleware attaches it after verifying
    const user = req.user;

    const paymentMethodEnums =
        OrderModel.schema.path('paymentMethod').enumValues;

    if (!paymentMethodEnums.includes(paymentMethod)) {
        return next(
            new CustomError('BadRequestError', 'Invalid payment method!', 400)
        );
    }

    let razorpayOrder;

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {

            // ATOMIC CART LOCK , returns updated data 
            await CartModel.findOneAndUpdate(
                { user: user._id, isProcessing: { $ne: true } },
                { $set: { isProcessing: true } },
                { new: true, session }
            )

            // get cart
            const cart = await populateCart(user, req.nearbyWarehouse, { session });

            if (!cart || cart.products.length === 0) {
                throw new CustomError(
                    'BadRequestError',
                    'Orders cannot be placed with an empty cart!',
                    400
                );
            }

            // filter out products that are not available in the warehouse           
            const products = cart.products.filter(item => item.warehouseQuantity > 0);

            if (products.length === 0) {
                throw new CustomError(
                    'BadRequestError',
                    'All items in your cart are out of stock!',
                    400
                );
            }

            const grandTotal = getCartSummary(products).grandTotal;

            // create razorpay order if needed
            if (paymentMethod !== 'cash_on_delivery') {
                razorpayOrder = await razorpay.orders.create({
                    amount: grandTotal * 100,
                    receipt: 'receipt#1',
                    method: paymentMethod,
                    payment_capture: 1,
                });
            }

            // CREATE ORDER
            const newOrder = (
                await OrderModel.create(
                    [
                        {
                            shippingAddress,
                            user: user._id,
                            paymentMethod,
                            orderStatus:
                                paymentMethod === 'cash_on_delivery'
                                    ? 'placed'
                                    : 'pending',
                            razorpayOrderID:
                                paymentMethod === 'cash_on_delivery'
                                    ? null
                                    : razorpayOrder.id,
                            products: products.map(item => ({
                                product: item.productDetails._id,
                                quantity: item.requestedQuantity,
                                priceAtPurchase:
                                    item.productDetails.price,
                            })),
                            warehouse: req.nearbyWarehouse._id,
                            totalAmount: grandTotal,
                            expectedDeliveryAt:
                                paymentMethod === 'cash_on_delivery'
                                    ? new Date(
                                        Date.now() +
                                        getRemainingDeliveryTime('placed')
                                    )
                                    : null,
                        },
                    ],
                    { session }
                )
            )[0];

            // reserve stock
            await reserveStock(
                products,
                user,
                req.nearbyWarehouse,
                session
            );

            //  clear cart + unlock
            await CartModel.findOneAndUpdate(
                { user: user._id },
                {
                    $set: {
                        products: [],
                        isProcessing: false,
                    },
                },
                { session }
            );

            // response
            if (paymentMethod === 'cash_on_delivery') {
                await startOrderProcessing({
                    orderID: newOrder._id,
                    productsName: products.map(
                        item => item.productDetails.name
                    ),
                    email: user.email,
                    createdAt: newOrder.createdAt,
                });

                return sendApiResponse(res, 201, {
                    message: 'Order placed successfully ✅',
                    data: newOrder,
                });
            } else {
                return sendApiResponse(res, 201, {
                    message: 'Order creation initiated',
                    data: {
                        razorpayOrderID: razorpayOrder.id,
                        amount: razorpayOrder.amount,
                        orderDB: newOrder,
                    },
                });
            }
        });
    } catch (err) {
        // unlock the cart on error
            await CartModel.findOneAndUpdate(
                { user: user._id, isProcessing: true },
                { $set: { isProcessing: false } }
            );

        return next(err);
    } finally {
        await session.endSession();
    }
};

// Razorpay makes a POST request on this handler/route for the payment result
const razorpayVerify = async (req, res, next) => {
    if (!req.rawBody) {
        return next(new CustomError('BadRequestError', 'Payload is required', 400));
    }

    // wrap JSON.parse so malformed body doesn't throw unhandled
    let payload;
    try {
        payload = JSON.parse(req.rawBody);
    } catch {
        return next(new CustomError('BadRequestError', 'Invalid JSON payload', 400));
    }

    const razorpaySignature = req.headers['x-razorpay-signature'];

    // verify signature FIRST, before any DB call
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest('hex');

    if (expectedSignature !== razorpaySignature) {
        return next(new CustomError('BadRequestError', 'Invalid signature', 400));
    }

    // DB queries only run after signature is verified
    const order = await OrderModel.findOne(
        { razorpayOrderID: payload.payload?.payment?.entity?.order_id }
    ).populate({
        model: 'user',
        path: 'user',
        select: 'email _id warehouse'
    });

    if (!order) {
        return next(new CustomError('NotFoundError', 'Order not found', 404));
    }

    // on payment failure
    if (payload.event === 'payment.failed') {
        if (order.paymentStatus !== 'failed') {
            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await updateProductsOnCancellation(order.products, order.warehouse, {session}); // restore stock
                    order.paymentStatus = 'failed'; // payment failed
                    await order.save({ session }); // save the order
                });
            } catch (err) {
                return next(err);
            } finally {
                await session.endSession(); // end session
            }
        }

        await addEmailToQueue(
            order.user.email,
            'Payment Failed',
            `Payment for your order placed on ${order.createdAt.toLocaleString()} has failed. Please try placing the order again.`
        );

        // on success
    } else if (payload.event === 'payment.captured') {
        // get cart
        const cart = await populateCart(order.user, { _id: order.warehouse });

        order.paymentStatus = 'paid';
        order.orderStatus = 'placed';
        order.expectedDeliveryAt = new Date(Date.now() + getRemainingDeliveryTime('placed'));

        // save order
        await order.save();

        await startOrderProcessing({
            orderID: order._id,
            productsName: cart.products.map(item => item.productDetails.name),
            email: order.user.email,
            createdAt: order.createdAt
        });
    }

    sendApiResponse(res, 201, { message: 'OK' });
};

// get orders
const getOrders = async (req, res, next) => {
    const user = req.user;
    const { filter, sort, limit, skip, select } = req.sanitizedQuery;
    console.log('query for get orders', req.sanitizedQuery);


    // get recent orders
    const orders = await OrderModel.find({ ...filter, user: user._id }).populate({
        path: 'products.product',
        model: 'product',
        select: 'name price images'
    })
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .select(select);


    // sort orders by status (reached_destination -> out_for_delivery >ready_for_pickup > processing > placed > pending > cancelled)
    const statusOrder = {
        reached_destination: 0,
        out_for_delivery: 1,
        ready_for_pickup: 2,
        processing: 3,
        placed: 4,
        pending: 5,
    };
    console.log('order statuses', orders.map(o => o.orderStatus))

    const sortedOrders = orders.length > 0 ? orders
        .sort((a, b) => statusOrder[a.orderStatus] - statusOrder[b.orderStatus])
        : [];

    console.log('order statuses after sorting', sortedOrders.map(o => o.orderStatus))


    sendApiResponse(res, 200, {
        data: sortedOrders
    });
}

// get order by ID
const getOrderByID = async (req, res, next) => {
    const orderID = req.params.id;
    const user = req.user;

    if (!orderID) {
        return next(
            new CustomError('BadRequestError', 'Order ID is required', 400)
        );
    }

    const order = await OrderModel.findOne({ _id: orderID, user: user._id }).populate({
        path: 'products.product',
        model: 'product',
        select: 'name price category'
    });

    if (!order) {
        return next(
            new CustomError('NotFoundError', 'Order not found', 404)
        );
    }

    sendApiResponse(res, 200, {
        data: order
    });
}

// cancel order (single order)
const cancelOrder = async (req, res, next) => {
    const orderID = req.params.id;
    const user = req.user;

    if (!orderID) {
        return next(
            new CustomError('BadRequestError', 'Order ID is required for cancellation', 400)
        );
    }

    let orderToCancel;
    let session;

    try {
        session = await mongoose.startSession();

        await session.withTransaction(async () => {
            orderToCancel = await OrderModel.findOne({
                _id: orderID,
                user: user._id
            })
                .session(session);

            // order was never made
            if (!orderToCancel) {
                throw new CustomError('NotFoundError', 'Order not found for cancellation', 404)
            }

            // already cancelled
            else if (orderToCancel.orderStatus === "cancelled") {
                throw new CustomError('BadRequestError', 'Order is already cancelled', 400)
            }

            // cannot cancel the order once it is out for delivery
            else if (orderToCancel.orderStatus === 'out_for_delivery') {
                throw new CustomError(
                    'BadRequestError',
                    `Orders can't be cancelled once out for delivery; you can refuse them at the door.`,
                    400)
            }

            // cancel the order, refund and save
            orderToCancel.orderStatus = 'cancelled';
            orderToCancel.paymentStatus = 'refunded';
            await orderToCancel.save({ session });

            // update products (restore stock, etc)
            await updateProductsOnCancellation(orderToCancel.products, orderToCancel.warehouse);

        })
    }
    catch (err) {
        return next(err);
    }
    finally {
        await session.endSession();
    }

    sendApiResponse(res, 200, {
        message: 'Order cancelled successfully',
        data: orderToCancel
    });
}

// handles acceptance or rejection of delivery when the order status is 'reached_destination'
const confirmDelivery = async (req, res, next) => {
    const user = req.user;
    const { isAccepted, id: orderID } = req.params;

    if (!orderID) {
        return next(new CustomError('BadRequestError', 'Order ID is required', 400));
    }

    let session, order;
    try {
        session = await mongoose.startSession();

        await session.withTransaction(async () => {
            order = await OrderModel.findOne({ _id: orderID, user: user._id })
                .populate('products.product', 'name')
                .session(session);

            // verify order    

            if (!order)
                throw new CustomError('NotFoundError', 'Order not found', 404);


            if (['cancelled', 'delivered'].includes(order.orderStatus))
                throw new CustomError('BadRequestError', 'Order has already been delivered or cancelled', 400);


            if (order.orderStatus !== 'reached_destination')
                throw new CustomError('BadRequestError', "You can’t confirm the order until the delivery partner reaches the destination", 400)

            // if the order is accepted by the user
            if (isAccepted === 'false') {
                // deny order
                order.orderStatus = 'cancelled';
                order.paymentStatus = 'refunded';
                await updateProductsOnCancellation(order.products, order.warehouse)

            } else {
                // accept order
                order.orderStatus = 'delivered';
                await updateProductsOnDelivery(order.products)
                order.paymentStatus = 'paid';
            }

            await order.save({ session });
        });

        // after transaction, prepare email and respond
        const productsName = order.products.map(p => p.product.name).join(', ');
        const emailDetails = {
            to: user.email,
            subject: order.orderStatus === 'cancelled' ? 'Order Cancelled' : 'Order Delivered',
            text: `Order for "${productsName}", placed on ${order.createdAt.toLocaleDateString()} has been ${order.orderStatus}.`
        };

        // add to the queue
        await addEmailToQueue(emailDetails.to, emailDetails.subject, emailDetails.text);

        return sendApiResponse(res, 200, {
            message: order.orderStatus === 'cancelled'
                ? 'Order has been cancelled as per your request'
                : 'Order confirmed and delivered successfully✅',
            data: order
        });

    } catch (err) {
        return next(err);
    } finally {
        await session.endSession();
    }
}

module.exports = { createOrder, razorpayVerify, getOrders, getOrderByID, cancelOrder, confirmDelivery }
