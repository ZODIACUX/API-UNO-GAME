const Joi = require('joi');

const createGameSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  rules: Joi.string().optional(),
  maxPlayers: Joi.number().integer().min(2).max(10).optional()
});

const joinGameSchema = Joi.object({
  game_id: Joi.number().integer().required()
});

const gameActionSchema = Joi.object({
  game_id: Joi.number().integer().required()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  createGameSchema,
  joinGameSchema,
  gameActionSchema,
  validateRequest
};
