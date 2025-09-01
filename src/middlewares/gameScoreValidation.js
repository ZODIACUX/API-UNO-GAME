const Joi = require('joi')

const scoreSchemas = {
  scoreData: Joi.object({
    gameId: Joi.number().required(),
    participantId: Joi.number().required(),
    points: Joi.number().min(0).required(),
    position: Joi.number().min(1).required()
  }),

  gameIdParam: Joi.object({
    gameId: Joi.number().required()
  }),

  participantIdParam: Joi.object({
    participantId: Joi.number().required()
  }),

  scoreIdParam: Joi.object({
    id: Joi.number().required()
  }),

  calculateScoresData: Joi.object({
    participants: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        points: Joi.number().min(0).required()
      })
    ).min(1).required()
  })
}

const validateScoreData = (req, res, next) => {
  let schema = scoreSchemas.scoreData
  if (req.path.includes('calculate-scores')) {
    schema = scoreSchemas.calculateScoresData
  }

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    })
  }
  next()
}

const validateScoreParams = (req, res, next) => {
  let schema
  if (req.params.gameId) {
    schema = scoreSchemas.gameIdParam
  } else if (req.params.participantId) {
    schema = scoreSchemas.participantIdParam
  } else if (req.params.id) {
    schema = scoreSchemas.scoreIdParam
  }

  if (schema) {
    const { error } = schema.validate(req.params)
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      })
    }
  }
  next()
}

module.exports = {
  validateScoreData,
  validateScoreParams
}
