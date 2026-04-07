const CustomError = require("../error-handling/customError.js");

/**
 * Middleware to validate that the user has selected a valid address 
 * from their profile before proceeding with order-related actions.
 */
const validateAddress = (req, res, next) => {
    const { addressID } = req.body;
    const user = req.user;

    if (!addressID) {
        return next(new CustomError('BadRequestError', 'Address ID is required', 400));
    }

    if (!user.addresses || user.addresses.length === 0) {
        return next(
            new CustomError(
                'BadRequestError',
                'Please add a shipping address to your profile before placing an order',
                400
            )
        );
    }

    // Check if the provided addressID exists in the user's saved addresses
    const shippingAddress = user.addresses.find(addr =>
        addr._id.equals(addressID)
    );

    if (!shippingAddress) {
        return next(
            new CustomError(
                'BadRequestError',
                'The provided address was not found in your saved addresses',
                404
            )
        );
    }

    // Attach the validated address to the request object for use in controllers
    req.shippingAddress = shippingAddress;
    next();
};

module.exports = validateAddress;
