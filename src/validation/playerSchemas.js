const Joi = require('joi');

const createPlayerSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required()
});

const updatePlayerSchema = Joi.object({
  username: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().max(150).optional(),
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  totalScore: Joi.number().min(0).optional(),
  gamesPlayed: Joi.number().min(0).optional()
});

module.exports = {
  createPlayerSchema,
  updatePlayerSchema
};
