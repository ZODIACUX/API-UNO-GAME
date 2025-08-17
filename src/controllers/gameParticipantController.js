const gameParticipantService = require('../services/gameParticipantService')
const { handleResponse, handleError } = require('../utils-api/responseHelper')

class GameParticipantController {
  joinGame = async (req, res) => {
    try {
      const { id: userId } = req.user
      const { gameId } = req.params
      const participant = await gameParticipantService.joinGame(userId, gameId)
      handleResponse(res, 201, 'Successfully joined game', participant)
    } catch (error) {
      handleError(res, error)
    }
  }

  leaveGame = async (req, res) => {
    try {
      const { id: userId } = req.user
      const { gameId } = req.params
      await gameParticipantService.leaveGame(userId, gameId)
      handleResponse(res, 200, 'Successfully left game')
    } catch (error) {
      handleError(res, error)
    }
  }

  getParticipants = async (req, res) => {
    try {
      const { gameId } = req.params
      const participants = await gameParticipantService.getParticipants(gameId)
      handleResponse(res, 200, 'Participants retrieved successfully', participants)
    } catch (error) {
      handleError(res, error)
    }
  }

  getParticipantStats = async (req, res) => {
    try {
      const { userId } = req.params
      const stats = await gameParticipantService.getParticipantStats(userId)
      handleResponse(res, 200, 'Stats retrieved successfully', stats)
    } catch (error) {
      handleError(res, error)
    }
  }

  getLeaderboard = async (req, res) => {
    try {
      const { limit } = req.query
      const leaderboard = await gameParticipantService.getLeaderboard(limit)
      handleResponse(res, 200, 'Leaderboard retrieved successfully', leaderboard)
    } catch (error) {
      handleError(res, error)
    }
  }
}

module.exports = new GameParticipantController()
