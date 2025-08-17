const Result = require('../errors/Result')

class BaseController {
  constructor() {
    this.handleResult = this.handleResult.bind(this)
  }

  handleResult(result, res, successStatus = 200) {
    if (result.isSuccess) {
      res.status(successStatus).json({
        success: true,
        data: result.value
      })
    } else {
      this.handleError(result.error, res)
    }
  }

  handleError(error, res) {
    const statusCode = this.getStatusCodeFromError(error)

    res.status(statusCode).json({
      success: false,
      error: error.message || 'An error occurred'
    })
  }

  getStatusCodeFromError(error) {
    const message = error.message?.toLowerCase() || ''

    if (message.includes('not found')) return 404
    if (message.includes('already exists') || message.includes('duplicate')) return 409
    if (message.includes('invalid') ||
        message.includes('required') ||
        message.includes('missing') ||
        message.includes('must be') ||
        message.includes('cannot be')) return 400
    if (message.includes('unauthorized') ||
        message.includes('credentials') ||
        message.includes('authentication') ||
        message.includes('token')) return 401
    if (message.includes('forbidden') ||
        message.includes('permission')) return 403
    return 500
  }

  validateRequired(fields, body) {
    const missing = []

    for (const field of fields) {
      if (!body[field]) {
        missing.push(field)
      }
    }

    if (missing.length > 0) {
      return Result.failure(new Error(`Required fields missing: ${missing.join(', ')}`))
    }

    return Result.success(body)
  }

  async executeAction(action, res, successStatus = 200) {
    try {
      const result = await action()
      this.handleResult(result, res, successStatus)
    } catch (error) {
      this.handleError(error, res)
    }
  }
}

module.exports = BaseController
