const Joi = require('joi')
const { handleError } = require('../utils/responseHelper')

const createGameSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  rules: Joi.string().optional(),
  maxPlayers: Joi.number().integer().min(2).max(10).optional()
})

const joinGameSchema = Joi.object({
  game_id: Joi.number().integer().required()
})

const gameActionSchema = Joi.object({
  game_id: Joi.number().integer().required()
})

const readyStatusSchema = Joi.object({
  isReady: Joi.boolean().required()
})

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return handleError(res, {
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
        statusCode: 400
      })
    }
    next()
  }
}

const isValidId = (id) => {
  const parsedId = parseInt(id)
  return !isNaN(parsedId) && parsedId > 0
}

const validateGameId = async (req, res, next) => {
  try {
    const { gameId } = req.params
    if (!isValidId(gameId)) {
      return handleError(res, { message: 'Invalid game ID', statusCode: 400 })
    }
    next()
  } catch (error) {
    return handleError(res, error)
  }
}

const validateReadyStatus = validateRequest(readyStatusSchema)

module.exports = {
  createGameSchema,
  joinGameSchema,
  gameActionSchema,
  readyStatusSchema,
  validateRequest,
  validateGameId,
  validateReadyStatus
}
