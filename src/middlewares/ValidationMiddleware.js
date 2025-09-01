const Result = require('../errors/Result')

class ValidationMiddleware {
  static validateBody(schema) {
    return (req, res, next) => {
      const result = ValidationMiddleware.validateData(req.body, schema)

      if (!result.isSuccess) {
        return res.status(400).json({
          error: result.error.message
        })
      }

      req.validatedBody = result.value
      next()
    }
  }

  static validateParams(schema) {
    return (req, res, next) => {
      const result = ValidationMiddleware.validateData(req.params, schema)

      if (!result.isSuccess) {
        return res.status(400).json({
          error: result.error.message
        })
      }

      req.validatedParams = result.value
      next()
    }
  }

  static validateQuery(schema) {
    return (req, res, next) => {
      const result = ValidationMiddleware.validateData(req.query, schema)

      if (!result.isSuccess) {
        return res.status(400).json({
          error: result.error.message
        })
      }

      req.validatedQuery = result.value
      next()
    }
  }

  static validateData(data, schema) {
    if (!schema || typeof schema !== 'object') {
      return Result.failure(new Error('Invalid validation schema'))
    }

    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors = ValidationMiddleware.validateField(field, value, rules)
      errors.push(...fieldErrors)
    }

    if (errors.length > 0) {
      return Result.failure(new Error(`Validation failed: ${errors.join(', ')}`))
    }

    return Result.success(data)
  }

  static validateField(fieldName, value, rules) {
    const errors = []

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`)
      return errors
    }

    if (value === undefined || value === null) {
      return errors
    }

    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== rules.type) {
        errors.push(`${fieldName} must be of type ${rules.type}`)
        return errors
      }
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters long`)
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} cannot exceed ${rules.maxLength} characters`)
    }

    if (rules.min && value < rules.min) {
      errors.push(`${fieldName} must be at least ${rules.min}`)
    }

    if (rules.max && value > rules.max) {
      errors.push(`${fieldName} cannot exceed ${rules.max}`)
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`)
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`)
    }

    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value)
      if (customResult !== true) {
        errors.push(customResult || `${fieldName} is invalid`)
      }
    }

    return errors
  }
}

module.exports = ValidationMiddleware
