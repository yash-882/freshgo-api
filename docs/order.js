/**
 * @swagger
 * /my-orders/create:
 *   post:
 *     summary: Create order and initiate Razorpay payment
 *     description: |
 *       If paymentMethod is not `cash_on_delivery`,
 *       this API returns `razorpayOrderID`
 *       The frontend must use Razorpay Checkout to complete the payment using the razorpay ID.
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
*           schema:
*             type: object
*             required: [addressID, paymentMethod]
*             properties:
*               addressID:
*                 type: string
*                 example: 64f2a91e9c7e123456789abc
*               paymentMethod:
*                 type: string
*                 enum:
*                   - cash_on_delivery
*                   - net_banking
*                   - card
*                   - upi
*                 example: cash_on_delivery
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input or empty cart
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     description: Fetch orders for the authenticated user using query filters.
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       # -------- ORDER STATUS FILTER --------
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - placed
 *             - processing
 *             - ready_for_pickup
 *             - delivered
 *             - cancelled
 *             - out_for_delivery
 *             - reached_destination
 *         description: Filter orders by order status
 *
 *       # -------- PAYMENT FILTERS --------
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - refunded
 *             - failed
 *         description: Filter orders by payment status
 *
 *       # -------- SORT / PAGINATION --------
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sort fields (comma-separated).
 *
 *           Prefix with `-` for descending order.
 *
 *           Example:
 *           `sort=createdAt,-totalAmount`
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of orders to return
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of orders to skip
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: |
 *           Fields to include or exclude (comma-separated).
 *
 *           - Include fields: `select=orderStatus,totalAmount,createdAt`
 *           - Exclude fields: `select=-products,-shippingAddress`
 *
 *           Mixing include and exclude is not allowed.
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /my-orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-orders/cancel/{id}:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-orders/confirm-delivery/{id}/{isAccepted}:
 *   post:
 *     summary: Accept or reject order delivery at the destination
 *     description: |
 *       If this endpoint is not called within 10 minutes after the order reaches
 *       the destination, the order is automatically cancelled.
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: isAccepted
 *         required: true
 *         schema:
 *           type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: Delivery confirmed or rejected
 *       400:
 *         description: Invalid order state
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */