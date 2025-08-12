const Joi = require('joi')
const { handleError } = require('../utils-api/responseHelper')

const cardSchema = Joi.object({
  type: Joi.string().valid('number', 'action', 'wild').required(),
  color: Joi.string().valid('red', 'blue', 'green', 'yellow', 'black').required(),
  value: Joi.string().valid(
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four'
  ).required()
})

const createCardsSchema = Joi.object({
  cards: Joi.array().items(cardSchema).min(1).required()
})

const validateCard = (req, res, next) => {
  const { error } = cardSchema.validate(req.body)
  if (error) {
    return handleError(res, {
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
      statusCode: 400
    })
  }
  next()
}

const validateCards = (req, res, next) => {
  const { error } = createCardsSchema.validate(req.body)
  if (error) {
    return handleError(res, {
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
      statusCode: 400
    })
  }
  next()
}

const validateCardParams = (req, res, next) => {
  const { id } = req.params
  if (!id || isNaN(parseInt(id))) {
    return handleError(res, {
      message: 'Invalid card ID',
      statusCode: 400
    })
  }
  next()
}

const validateCardType = (req, res, next) => {
  const { type } = req.params
  const validTypes = ['number', 'action', 'wild']
  if (!type || !validTypes.includes(type)) {
    return handleError(res, {
      message: 'Invalid card type',
      statusCode: 400
    })
  }
  next()
}

const validateCardColor = (req, res, next) => {
  const { color } = req.params
  const validColors = ['red', 'blue', 'green', 'yellow', 'black']
  if (!color || !validColors.includes(color)) {
    return handleError(res, {
      message: 'Invalid card color',
      statusCode: 400
    })
  }
  next()
}

module.exports = {
  validateCard,
  validateCards,
  validateCardParams,
  validateCardType,
  validateCardColor
}
