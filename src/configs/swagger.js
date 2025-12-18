// Swagger config

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grocery E-Commerce API',
      version: '1.0.0',
      description: 'Backend-only API for grocery e-commerce platform'
    },
    servers: [
      {
        url: 'https://freshgo.onrender.com/api',
        description: 'Production server'
      }
    ],
    components: {
      // Access token retreival from Cookies
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'AT'
        }
      }
    },
  },
  apis: ['./docs/*'] // where route comments live
};

module.exports = swaggerJsdoc(options);
