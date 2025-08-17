const gamePlayerService = require('../services/gamePlayerService')
const { handleResponse, handleError } = require('../utils-api/responseHelper')

class GamePlayerController {
  joinGame = async (req, res) => {
    try {
      const { gameId } = req.params
      const userId = req.user.id

      const gamePlayer = await gamePlayerService.joinGame(userId, gameId)
      return handleResponse(res, 201, 'Successfully joined game', gamePlayer)
    } catch (error) {
      return handleError(res, error)
    }
  }

  leaveGame = async (req, res) => {
    try {
      const { gameId } = req.params
      const userId = req.user.id

      await gamePlayerService.leaveGame(userId, gameId)
      return handleResponse(res, 200, 'Successfully left game')
    } catch (error) {
      return handleError(res, error)
    }
  }

  setReady = async (req, res) => {
    try {
      const { gameId } = req.params
      const { isReady } = req.body
      const userId = req.user.id

      const gamePlayer = await gamePlayerService.setReady(userId, gameId, isReady)
      return handleResponse(res, 200, 'Ready status updated', gamePlayer)
    } catch (error) {
      return handleError(res, error)
    }
  }

  getGamePlayers = async (req, res) => {
    try {
      const { gameId } = req.params

      const players = await gamePlayerService.getGamePlayers(gameId)
      return handleResponse(res, 200, 'Players retrieved successfully', players)
    } catch (error) {
      return handleError(res, error)
    }
  }
}

module.exports = new GamePlayerController()
