const Joi = require('joi')

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }
    next()
  }
}

module.exports = {
  registerSchema,
  loginSchema,
  validateRequest
}
