const Joi = require('joi');

const createCardSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().max(50).required(),
  value: Joi.number().default(0),
  rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary').required(),
  isActive: Joi.boolean().default(true),
  attributes: Joi.object().optional()
});

const updateCardSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).optional(),
  type: Joi.string().max(50).optional(),
  value: Joi.number().optional(),
  rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary').optional(),
  isActive: Joi.boolean().optional(),
  attributes: Joi.object().optional()
});

module.exports = {
  createCardSchema,
  updateCardSchema
};
