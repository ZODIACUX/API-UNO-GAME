const Joi = require('joi')

const participantSchemas = {
  gameIdParam: Joi.object({
    gameId: Joi.number().required()
  }),

  userIdParam: Joi.object({
    userId: Joi.number().required()
  }),

  leaderboardQuery: Joi.object({
    limit: Joi.number().min(1).max(100).default(10)
  })
}

const validateParticipantParams = (req, res, next) => {
  let schema
  if (req.params.gameId) {
    schema = participantSchemas.gameIdParam
  } else if (req.params.userId) {
    schema = participantSchemas.userIdParam
  } else if (req.query.limit) {
    schema = participantSchemas.leaderboardQuery
  }

  if (schema) {
    const { error } = schema.validate(req.params || req.query)
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
  validateParticipantParams
}
