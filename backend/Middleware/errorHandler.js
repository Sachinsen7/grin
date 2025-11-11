const { sendError } = require('../utills/response');
const logger = require('../utills/logger');

/**
 * Global Error Handling Middleware.
 * This catches all errors passed from controllers.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { 
    stack: err.stack, 
    path: req.path, 
    method: req.method 
  });

  // Determine status code and message
  // If it's a known error we created, use its status. Otherwise, 500.
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const errorCode = err.errorCode || 'SERVER_ERROR';

  // Send the standardized JSON error response
  sendError(res, message, statusCode, errorCode);
};

module.exports = errorHandler;