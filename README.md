# 🛍️ E-Commerce Grocery Platform API
*A backend-only REST API designed to be consumed by web or mobile frontends.*

This project is an e-commerce grocery platform API built with Node.js, Express, and MongoDB. It exposes RESTful endpoints for managing products, categories, users, carts, orders, and authentication. Redis is used for caching frequently accessed data, while BullMQ handles asynchronous tasks such as order processing and email notifications. Authentication is implemented using JWT and Google OAuth2, making the API suitable for integration with frontend applications.

## 🚀 Key Features

- **Authentication & Authorization**: Secure user authentication using JWTs and Google OAuth2.

- **Product Management**: Comprehensive endpoints for managing products, including searching, filtering, and retrieving product details.

- **Category Management**: API endpoints for creating, retrieving, and managing product categories and subcategories.

- **Cart Management**: Functionality for adding products to the cart, updating quantities, and calculating cart totals.

- **Order Management**: Complete order processing flow, including order creation, payment integration (Razorpay), order status updates and a simplified estimated delivery time based on fixed status-to-status intervals.

- **User Profile Management**: Endpoints for users to manage their profiles and addresses.

- **Caching**: Redis used for caching frequently accessed data.

- **Asynchronous Tasks**: Message queues (BullMQ) for handling asynchronous tasks like order processing and email sending.

- **Geospatial Queries**: Supports basic location-based warehouse queries.

- **Warehouse Management**: API endpoints for managing warehouses and tracking product inventory in different locations.

- **Rate Limiting**: Implemented to protect API from abuse.

- **AI Product Identification**: Uses Groq-hosted LLMs via an OpenAI-compatible API to identify products or categories from images.

- **AI-Generated Product Metadata**: Uses an LLM to generate initial product metadata to reduce manual effort for admins.

- **Basic Recommendations**: Simple recommendation logic based on past orders (not ML-based).

- **Role-Based Analytics Access**: Revenue and sales statistics accessible only to authorized roles such as managers and admins.

## ⚠️ Limitations

- Recommendation system is rule-based, not ML-trained.
- LLMs might produce inaccurate or misleading results.
- Not optimized for very high traffic without further scaling.
- Warehouse geolocation is restricted to Indian coordinates using schema-level validation.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Passport.js, JWT, Google OAuth2
- **Caching**: Redis
- **Message Queue**: BullMQ (ioredis)
- **Payment Gateway**: Razorpay
- **Environment Variables**: dotenv
- **HTTP Security**: Helmet
- **CORS**: CORS
- **Request Parsing**: qs, cookie-parser
- **ORM**: Mongoose
- **Email Sending**: Mailjet
- **Rate Limiting**: express-rate-limit
- **AI Tools**: AI features are powered by Groq via an OpenAI-compatible API, with the OpenAI SDK used as the client for request formatting and communication.


## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- Mailjet account
- Razorpay account
- Google OAuth2 credentials

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yash-882/freshgo-api
    cd freshgo-api
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:

    - Create a `.env` file in the `src/configs/` directory.
    - Add the following environment variables, replacing the placeholders with your actual values:

    ```
    PORT=8000
    MONGODB_URI=<your-mongodb-uri>
    REDIS_HOST=<your-redis-host>
    REDIS_PORT=<your-redis-port>
    REDIS_USERNAME=<your-redis-username>
    REDIS_PASSWORD=<your-redis-password>
    MAILJET_API_KEY=<your-mailjet-api-key>
    MAILJET_API_SECRET=<your-mailjet-api-secret>
    RAZORPAY_KEY_ID=<your-razorpay-key-id>
    RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
    GOOGLE_CLIENT_ID=<your-google-client-id>
    GOOGLE_CLIENT_SECRET=<your-google-client-secret>
    GOOGLE_CALLBACK_URL=<your-google-callback-url>
    JWT_SECRET=<your-jwt-secret>
    JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
    ```

### Start the server

```bash
npm run dev
```

## 📂 Project Structure

```
├── src/
│   ├── app.js              # Main Express application
│   ├── server.js           # Server startup and database connection
│   ├── configs/            # Configuration files
│   │   ├── loadEnv.js      # Loads environment variables
│   │   ├── redisClient.js  # Redis client configuration
│   │   ├── ioredisClient.js # IORedis client configuration (BullMQ)
│   │   ├── cors.js         # CORS configuration
│   │   ├── razorpay.js     # Razorpay configuration
│   │   └── file.env        # Environment variables file
│   ├── controllers/        # Route handlers
│   │   ├── productCategory.js # Product category controllers
│   │   ├── product.js      # Product controllers
│   │   ├── auth.js         # Authentication controllers
│   │   ├── apiEntry.js     # API entry point controllers
│   │   ├── order.js        # Order controllers
│   │   ├── user.js         # User controllers
│   │   └── cart.js         # Cart controllers
│   ├── middlewares/        # Custom middleware
│   │   └── error.js        # Error handling middleware
│   ├── models/             # Mongoose models
│   │   ├── warehouse.js    # Warehouse model
│   │   ├── productCategory.js # Product category model
│   │   ├── product.js      # Product model
│   │   ├── user.js         # User model
│   │   ├── order.js        # Order model
│   │   └── cart.js         # Cart model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── admin.js        # Admin routes
│   │   ├── product.js      # Product routes
│   │   ├── cart.js         # Cart routes
│   │   ├── user.js         # User routes
│   │   ├── order.js        # Order routes
│   │   ├── category.js     # Category routes
│   │   ├── productManager.js # Product Manager routes
│   │   └── warehouse.js    # Warehouse routes
│   ├── auth-strategies/    # Authentication strategies
│   │   └── googleAuth.js   # Google OAuth2 strategy
│   ├── error-handling/     # Custom error handling
│   │   └── customError.js  # Custom error class
│   ├── utils/              # Utility functions
│   │   ├── apiResponse.js  # API response utility
│   │   ├── mailjet.js      # Mailjet integration
│   │   ├── queries/        # Database queries
│   │   │   └── product.js  # Product queries
│   │   ├── helpers/        # Helper functions
│   │   │   ├── jwt.js      # JWT helper functions
│   │   │   ├── auth.js     # Authentication helper functions
│   │   │   ├── cache.js    # Caching helper functions
│   │   │   ├── cart.js     # Cart helper functions
│   │   │   ├── product.js  # Product helper functions
│   │   │   └── order.js    # Order helper functions
│   │   ├── classes/        # Custom classes
│   │   │   └── redisService.js # Redis service class
│   │   ├── ai/             # AI related utilities
│   │   │   └── identifyProductAi.js # AI product identification
│   │   └── queues/         # Message queues
│   │       ├── order.js    # Order queue
│   │       └── email.js    # Email queue
│   ├── constants/          # Constant values
│   │   ├── cacheKeyBuilders.js # Cache key builders
│   │   └── productCategories.js # Product categories
│   └── queues/             # Queue definitions
│       ├── order.js        # Order processing queue
│       └── email.js        # Email sending queue
├── package.json
├── README.md
└── .gitignore
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## 📬 Contact

Yash — yashh2nd@gmail.com

## Thanks

Thank you for checking out this project! We hope it's helpful.
