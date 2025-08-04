class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // TypeORM errors
  if (err.name === 'QueryFailedError') {
    let message = 'Database query failed';
    let statusCode = 400;

    // Handle specific MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      message = 'Duplicate entry - resource already exists';
      statusCode = 409;
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      message = 'Referenced resource does not exist';
      statusCode = 400;
    }

    error = new AppError(message, statusCode);
  }

  // EntityNotFound error
  if (err.name === 'EntityNotFoundError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message.join(', '), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = {
  AppError,
  errorHandler
};