const Joi = require('joi');

const createScoreSchema = Joi.object({
  playerId: Joi.string().uuid().required(),
  gameId: Joi.string().uuid().required(),
  score: Joi.number().default(0),
  level: Joi.number().default(0),
  gameDate: Joi.date().optional(),
  gameData: Joi.object().optional()
});

const updateScoreSchema = Joi.object({
  score: Joi.number().optional(),
  level: Joi.number().optional(),
  gameDate: Joi.date().optional(),
  gameData: Joi.object().optional()
});

module.exports = {
  createScoreSchema,
  updateScoreSchema
};