const cardService = require('../services/cardService')
const { handleResponse, handleError } = require('../utils-api/responseHelper')

class CardController {
  async getCard(req, res) {
    try {
      const { id } = req.params
      const card = await cardService.getCardById(id)
      return handleResponse(res, 200, 'Card retrieved successfully', card)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getCardsByType(req, res) {
    try {
      const { type } = req.params
      const cards = await cardService.getCardsByType(type)
      return handleResponse(res, 200, 'Cards retrieved successfully', cards)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getCardsByColor(req, res) {
    try {
      const { color } = req.params
      const cards = await cardService.getCardsByColor(color)
      return handleResponse(res, 200, 'Cards retrieved successfully', cards)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async getAllCards(req, res) {
    try {
      const cards = await cardService.getAllCards()
      return handleResponse(res, 200, 'Cards retrieved successfully', cards)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async createCard(req, res) {
    try {
      const cardData = req.body
      const card = await cardService.createCard(cardData)
      return handleResponse(res, 201, 'Card created successfully', card)
    } catch (error) {
      return handleError(res, error)
    }
  }

  async createManyCards(req, res) {
    try {
      const { cards } = req.body
      if (!Array.isArray(cards)) {
        return handleError(res, { message: 'Cards must be an array', statusCode: 400 })
      }
      const createdCards = await cardService.createManyCards(cards)
      return handleResponse(res, 201, 'Cards created successfully', createdCards)
    } catch (error) {
      return handleError(res, error)
    }
  }
}

module.exports = new CardController()
