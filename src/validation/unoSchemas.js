const Joi = require('joi');

const registerUserSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(6).max(100).required()
});

const loginUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const logoutUserSchema = Joi.object({
  access_token: Joi.string().required()
});

const createUnoGameSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  rules: Joi.string().optional(),
  access_token: Joi.string().optional()
});

const joinGameSchema = Joi.object({
  game_id: Joi.number().integer().required(),
  access_token: Joi.string().optional()
});

const gameActionSchema = Joi.object({
  game_id: Joi.number().integer().required(),
  access_token: Joi.string().optional()
});

const gameIdSchema = Joi.object({
  game_id: Joi.number().integer().required()
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  createUnoGameSchema,
  joinGameSchema,
  gameActionSchema,
  gameIdSchema
};