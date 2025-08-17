const gameScoreService = require('../services/gameScoreService')
const { handleResponse, handleError } = require('../utils-api/responseHelper')

class GameScoreController {
  createScore = async (req, res) => {
    try {
      const scoreData = req.body
      const score = await gameScoreService.createScore(scoreData)
      handleResponse(res, 201, 'Score created successfully', score)
    } catch (error) {
      handleError(res, error)
    }
  }

  updateScore = async (req, res) => {
    try {
      const { id } = req.params
      const scoreData = req.body
      const score = await gameScoreService.updateScore(id, scoreData)
      handleResponse(res, 200, 'Score updated successfully', score)
    } catch (error) {
      handleError(res, error)
    }
  }

  getGameScores = async (req, res) => {
    try {
      const { gameId } = req.params
      const scores = await gameScoreService.getGameScores(gameId)
      handleResponse(res, 200, 'Game scores retrieved successfully', scores)
    } catch (error) {
      handleError(res, error)
    }
  }

  getParticipantScores = async (req, res) => {
    try {
      const { participantId } = req.params
      const scores = await gameScoreService.getParticipantScores(participantId)
      handleResponse(res, 200, 'Participant scores retrieved successfully', scores)
    } catch (error) {
      handleError(res, error)
    }
  }

  getHighScores = async (req, res) => {
    try {
      const { limit } = req.query
      const highScores = await gameScoreService.getHighScores(limit)
      handleResponse(res, 200, 'High scores retrieved successfully', highScores)
    } catch (error) {
      handleError(res, error)
    }
  }

  calculateFinalScores = async (req, res) => {
    try {
      const { gameId } = req.params
      const { participants } = req.body
      const scores = await gameScoreService.calculateFinalScores(gameId, participants)
      handleResponse(res, 201, 'Final scores calculated and saved successfully', scores)
    } catch (error) {
      handleError(res, error)
    }
  }
}

module.exports = new GameScoreController()
