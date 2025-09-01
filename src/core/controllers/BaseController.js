const Result = require('../errors/Result')

/**
 * Base Controller - Provides common functionality for all controllers
 * Implements SRP (Single Responsibility Principle)
 */
class BaseController {
  /**
   * Execute an action and handle the result
   * @param {Function} action - Action to execute
   * @param {Object} res - Express response object
   * @param {number} successStatus - Success status code (default: 200)
   */
  async executeAction(action, res, successStatus = 200) {
    try {
      const result = await action()
      return this.handleResult(result, res, successStatus)
    } catch (error) {
      console.error('Controller error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Handle a Result object and send appropriate response
   * @param {Result} result - Result object
   * @param {Object} res - Express response object
   * @param {number} successStatus - Success status code
   */
  handleResult(result, res, successStatus = 200) {
    if (result.isSuccess) {
      return res.status(successStatus).json(result.value)
    } else {
      const statusCode = this.getErrorStatusCode(result.error)
      return res.status(statusCode).json({
        error: result.error.message || 'An error occurred'
      })
    }
  }

  /**
   * Get appropriate HTTP status code for error
   * @param {Error} error - Error object
   * @returns {number} HTTP status code
   */
  getErrorStatusCode(error) {
    const message = error.message.toLowerCase()

    if (message.includes('not found')) {
      return 404
    }
    if (message.includes('unauthorized') || message.includes('invalid credentials')) {
      return 401
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return 403
    }
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 400
    }
    if (message.includes('conflict') || message.includes('already exists')) {
      return 409
    }

    return 500
  }

  /**
   * Validate required fields in request body
   * @param {Object} body - Request body
   * @param {Array<string>} requiredFields - Required field names
   * @returns {Result} Validation result
   */
  validateRequiredFields(body, requiredFields) {
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return Result.failure(new Error(`Missing required fields: ${missingFields.join(', ')}`))
    }

    return Result.success(true)
  }

  /**
   * Extract user ID from request
   * @param {Object} req - Express request object
   * @returns {Result} Result containing user ID
   */
  extractUserId(req) {
    const userId = req.user?.id

    if (!userId) {
      return Result.failure(new Error('User not authenticated'))
    }

    return Result.success(userId)
  }

  /**
   * Parse integer parameter from request
   * @param {Object} req - Express request object
   * @param {string} paramName - Parameter name
   * @returns {Result} Result containing parsed integer
   */
  parseIntParam(req, paramName) {
    const value = req.params[paramName]
    const parsed = parseInt(value, 10)

    if (isNaN(parsed)) {
      return Result.failure(new Error(`Invalid ${paramName}: must be a number`))
    }

    return Result.success(parsed)
  }
}

module.exports = BaseController
