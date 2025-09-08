const logger = require('../utils/logger')

class ErrorHandler {
  static handle(error, req, res, _next) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }

    const statusCode = ErrorHandler.getStatusCode(error)

    if (statusCode >= 500) {
      logger.error('Server Error', errorInfo)
    } else {
      logger.warn('Client Error', errorInfo)
    }

    const response = {
      success: false,
      message: error.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: errorInfo
      })
    }

    res.status(statusCode).json(response)
  }

  static getStatusCode(error) {
    if (error.statusCode) return error.statusCode
    if (error.status) return error.status

    const message = error.message?.toLowerCase() || ''

    if (message.includes('not found')) return 404
    if (message.includes('already exists') || message.includes('duplicate')) return 409
    if (message.includes('invalid') ||
        message.includes('required') ||
        message.includes('must be') ||
        message.includes('cannot be')) return 400
    if (message.includes('unauthorized') ||
        message.includes('credentials') ||
        message.includes('token')) return 401
    if (message.includes('forbidden') ||
        message.includes('permission')) return 403
    if (message.includes('too many')) return 429

    return 500
  }

  static notFound(req, res, next) {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`)
    error.statusCode = 404
    next(error)
  }

  static validation(error, req, res, next) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      const customError = new Error(`Validation failed: ${validationErrors.join(', ')}`)
      customError.statusCode = 400
      return ErrorHandler.handle(customError, req, res, next)
    }
    next(error)
  }

  static async asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

module.exports = ErrorHandler
