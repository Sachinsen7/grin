/**
 * Standardized success response
 * @param {object} res - Express response object
 * @param {*} data - The payload to send
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data: data,
  });
};

/**
 * Standardized error response
 * @param {object} res - Express response object
 * @param {string} message - A clean, user-friendly error message
 * @param {number} [statusCode=400] - HTTP status code
 * @param {string} [errorCode='GENERIC_ERROR'] - A specific error code for frontend logic
 */
const sendError = (res, message, statusCode = 400, errorCode = 'GENERIC_ERROR') => {
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
};