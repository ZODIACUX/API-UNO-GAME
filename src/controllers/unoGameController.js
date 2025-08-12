const unoGameService = require('../services/unoGameService')
const { handleResponse, handleError } = require('../utils-api/responseHelper')

class UnoGameController {
  async createGame(req, res) {
    try {
      const { name, maxPlayers } = req.body
      const creatorId = req.user.id
      const game = await unoGameService.createGame(name, creatorId, maxPlayers)
      return handleResponse(res, 201, 'Game created successfully', game)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getGame(req, res) {
    try {
      const { id } = req.params
      const game = await unoGameService.getGame(id)
      return handleResponse(res, 200, 'Game retrieved successfully', game)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getAllGames(req, res) {
    try {
      const games = await unoGameService.getAllGames()
      return handleResponse(res, 200, 'Games retrieved successfully', games)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getActiveGames(req, res) {
    try {
      const games = await unoGameService.getActiveGames()
      return handleResponse(res, 200, 'Active games retrieved successfully', games)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async startGame(req, res) {
    try {
      const { id } = req.params
      const game = await unoGameService.startGame(id)
      return handleResponse(res, 200, 'Game started successfully', game)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async playCard(req, res) {
    try {
      const { id } = req.params
      const { cardId } = req.body
      const playerId = req.user.id
      const game = await unoGameService.playCard(id, playerId, cardId)
      return handleResponse(res, 200, 'Card played successfully', game)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async drawCard(req, res) {
    try {
      const { id } = req.params
      const playerId = req.user.id
      const game = await unoGameService.drawCard(id, playerId)
      return handleResponse(res, 200, 'Card drawn successfully', game)
    } catch (error) {
      return handleError(res, error)
    }
  }
}

module.exports = new UnoGameController()
