const express = require('express');
const app = express();

// import routers
const authRouter = require('./routes/auth.js');
const productRouter = require('./routes/product.js');
const cartRouter = require('./routes/cart.js');
const userRouter = require('./routes/user.js');
const orderRouter = require('./routes/order.js');
const adminRouter = require('./routes/admin/adminGateway.js');
const categoryRouter = require('./routes/productCategory.js');
const productRouterManager = require('./routes/manager/product.js');
const warehouseRouter = require('./routes/manager/warehouse.js');

// auth strategies
const googleAuth = require('./auth-strategies/googleAuth.js');

// custom module
const GlobalErrorHandler = require('./middlewares/error.js');
const CustomError = require('./error-handling/customError.js');

// npm packages
const passport = require('passport');
const cookieParser = require('cookie-parser');
const qs = require('qs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configs/swagger');
const morgan = require('morgan');

// configs
const setCors = require('./configs/cors.js');

// set security HTTP headers
app.use(helmet())

// allow requests from the specified client origin and include credentials (like cookies) 
app.use(setCors())

//log requests 
app.use(morgan('combined'))

// parses query strings ("?price[gt]=20&sort=-price" -> {price: {gt: "20"}, sort="-price"})
app.set("query parser", query => qs.parse(query))

// body parser
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.headers['x-razorpay-signature']) {
            req.rawBody = buf.toString(); // store raw body for webhook signature verification
        }
    }
}))

app.use(express.urlencoded({ extended: true })) // parse Form data



// rate limiter
app.use(rateLimit({
    windowMs: 1000 * 60, // 1 minute
    max: 100, // limit each IP to 40 requests per windowMs
    handler: (req, res, next) =>
        next(new CustomError(
            'TooManyRequestsError',
            'Too many requests, please try again later.',
            429))
}));


// handle empty body for PUT, POST, PATCH requests
app.use((req, res, next) => {
    const methodsWithBody = new Set(['POST', 'PUT', 'PATCH'])
    
    if (methodsWithBody.has(req.method.toUpperCase()) && !req.body)
        req.body = {}
    
    next()
})

app.use(cookieParser()) // parse cookies


app.use(passport.initialize()) // initialize passport

passport.use(googleAuth) // google OAUTH2


// backend root
app.get('/', (req, res, next) => {
    res.send('API is working. Visit /api/docs to test it.')
});

// API documentations
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth-related routes
app.use('/api/auth', authRouter);

app.use('/api/admin', adminRouter); // Admin-only routes

// Authenticated user routes
app.use('/api/my-profile', userRouter);
app.use('/api/my-cart', cartRouter);
app.use('/api/my-orders', orderRouter);

// Product routes
app.use('/api/manager/products', productRouterManager); // Warehouse manager
app.use('/api/products', productRouter);                 // Public

// Categories & warehouses
app.use('/api/product-categories', categoryRouter); //public
app.use('/api/manager/warehouse', warehouseRouter); //Warehouse manager


// NOT-FOUND middleware: triggers when no route matches
app.use((req, res, next) => 
    next(new CustomError('NotFoundError', `Route(${req.originalUrl}) not found!`, 404)));

// Global error handler
app.use(GlobalErrorHandler);

module.exports = app;