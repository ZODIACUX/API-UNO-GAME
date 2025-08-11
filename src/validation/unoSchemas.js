const Joi = require('joi');

// Esquemas exactos según la especificación
const registerUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const loginUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().optional()

});

const logoutUserSchema = Joi.object({
  access_token: Joi.string().required()
});

const profileSchema = Joi.object({
  access_token: Joi.string().required()
});

const createGameSchema = Joi.object({
  name: Joi.string().required(),
  rules: Joi.string().optional(),
  access_token: Joi.string().optional()
});

const gameActionSchema = Joi.object({
  game_id: Joi.number().integer().required(),
  access_token: Joi.string().required()
});

const gameIdOnlySchema = Joi.object({
  game_id: Joi.number().integer().required()
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  profileSchema,
  createGameSchema,
  gameActionSchema,
  gameIdOnlySchema
};
