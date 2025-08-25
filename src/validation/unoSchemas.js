const Joi = require('joi')

// Esquemas exactos según la especificación
const registerUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const loginUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().optional()

})

const logoutUserSchema = Joi.object({
  access_token: Joi.string().required()
})

const profileSchema = Joi.object({
  access_token: Joi.string().required()
})

const createGameSchema = Joi.object({
  name: Joi.string().required(),
  rules: Joi.string().optional(),
  access_token: Joi.string().optional()
})

const gameActionSchema = Joi.object({
  game_id: Joi.number().integer().required(),
  access_token: Joi.string().required()
})

const gameIdOnlySchema = Joi.object({
  game_id: Joi.number().integer().required()
})

const cardDistributionSchema = Joi.object({
  players: Joi.array().items(Joi.string().min(1).max(50)).min(2).max(10).required(),
  cardsPerPlayer: Joi.number().integer().min(1).max(20).default(7)
})

const cardPlaySchema = Joi.object({
  player: Joi.string().min(1).max(50).required(),
  cardPlayed: Joi.string().min(1).max(50).required(),
  targetColor: Joi.string().valid('Red', 'Blue', 'Green', 'Yellow').optional()
})

const cardDrawSchema = Joi.object({
  player: Joi.string().min(1).max(50).required()
})

const unoCallSchema = Joi.object({
  player: Joi.string().min(1).max(50).required(),
  action: Joi.string().valid('Say UNO').required()
})

const unoChallengeSchema = Joi.object({
  challenger: Joi.string().min(1).max(50).required(),
  challengedPlayer: Joi.string().min(1).max(50).required()
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
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  profileSchema,
  createGameSchema,
  gameActionSchema,
  gameIdOnlySchema,
  cardDistributionSchema,
  cardPlaySchema,
  cardDrawSchema,
  unoCallSchema,
  unoChallengeSchema,
  validateRequest
}
