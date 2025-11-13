class AppError extends Error {
  constructor(message, statusCode, errorCode = 'GENERIC_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // To flag this as a "trusted" error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;