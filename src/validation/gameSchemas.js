const Joi = require('joi');

const createGameSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().max(50).required(),
  minPlayers: Joi.number().min(1).default(1),
  maxPlayers: Joi.number().min(1).default(10),
  difficulty: Joi.number().min(0).max(10).default(0),
  isActive: Joi.boolean().default(true)
});

const updateGameSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string().max(50).optional(),
  minPlayers: Joi.number().min(1).optional(),
  maxPlayers: Joi.number().min(1).optional(),
  difficulty: Joi.number().min(0).max(10).optional(),
  isActive: Joi.boolean().optional()
});

module.exports = {
  createGameSchema,
  updateGameSchema
};