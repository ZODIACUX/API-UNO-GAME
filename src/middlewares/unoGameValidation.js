const Joi = require('joi')
const { handleError } = require('../utils/responseHelper')

const createGameSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Game name must be at least 3 characters long',
      'string.max': 'Game name cannot exceed 100 characters',
      'any.required': 'Game name is required'
    }),
  maxPlayers: Joi.number()
    .integer()
    .min(2)
    .max(10)
    .default(4)
    .messages({
      'number.base': 'Maximum players must be a number',
      'number.min': 'Game must have at least 2 players',
      'number.max': 'Game cannot have more than 10 players'
    })
})

const playCardSchema = Joi.object({
  cardId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Card ID must be a number',
      'any.required': 'Card ID is required'
    })
})

const validateCreateGame = (req, res, next) => {
  const { error } = createGameSchema.validate(req.body, { abortEarly: false })
  if (error) {
    return handleError(res, {
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
      statusCode: 400
    })
  }
  next()
}

const validatePlayCard = (req, res, next) => {
  const { error } = playCardSchema.validate(req.body, { abortEarly: false })
  if (error) {
    return handleError(res, {
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
      statusCode: 400
    })
  }
  next()
}

const validateGameId = (req, res, next) => {
  const { id } = req.params
  if (!id || isNaN(parseInt(id))) {
    return handleError(res, {
      message: 'Invalid game ID',
      statusCode: 400
    })
  }
  next()
}

module.exports = {
  validateCreateGame,
  validatePlayCard,
  validateGameId
}
