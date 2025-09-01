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

const nextTurnSchema = Joi.object({
  players: Joi.array().items(Joi.string()).min(2).required(),
  currentPlayerIndex: Joi.number().integer().min(0).required()
})

const playCardSchema = Joi.object({
  cardPlayed: Joi.string().valid('skip', 'reverse').required(),
  currentPlayerIndex: Joi.number().integer().min(0).required(),
  players: Joi.array().items(Joi.string()).min(2).required(),
  direction: Joi.string().valid('clockwise', 'counterclockwise').required()
})

const drawCardSchema = Joi.object({
  playerHand: Joi.array().items(Joi.string()).required(),
  deck: Joi.array().items(Joi.string()).min(1).required(),
  currentCard: Joi.string().required()
})

module.exports = {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  profileSchema,
  createGameSchema,
  gameActionSchema,
  gameIdOnlySchema,
  nextTurnSchema,
  playCardSchema,
  drawCardSchema
}
