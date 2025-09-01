const Result = require('../utils/Result')
const CardService = require('../services/cardService')

class CardController {
  constructor() {
    this.cardService = new CardService()
  }

  validateRequired(fields, data) {
    const missing = fields.filter(field => !data[field])
    if (missing.length > 0) {
      return Result.failure(new Error(`Missing required fields: ${missing.join(', ')}`))
    }
    return Result.success(data)
  }

  async executeAction(action, res, successStatus = 200) {
    try {
      const result = await action()
      if (result.isSuccess) {
        return res.status(successStatus).json(result.value)
      } else {
        const statusCode = result.error.message.includes('not found') ? 404 : 400
        return res.status(statusCode).json({ error: result.error.message })
      }
    } catch (error) {
      console.error('Controller error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  getCard = async (req, res) => {
    await this.executeAction(async () => {
      const { id } = req.params
      if (!id) {
        return Result.failure(new Error('Card ID is required'))
      }

      return await this.cardService.getCardById(id)
    }, res)
  }

  getCardsByType = async (req, res) => {
    await this.executeAction(async () => {
      const { type } = req.params
      if (!type) {
        return Result.failure(new Error('Card type is required'))
      }

      return await this.cardService.getCardsByType(type)
    }, res)
  }

  getCardsByColor = async (req, res) => {
    await this.executeAction(async () => {
      const { color } = req.params
      if (!color) {
        return Result.failure(new Error('Card color is required'))
      }

      return await this.cardService.getCardsByColor(color)
    }, res)
  }

  getAllCards = async (req, res) => {
    await this.executeAction(async () => {
      return await this.cardService.getAllCards()
    }, res)
  }

  createCard = async (req, res) => {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['type', 'color', 'value'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      return await this.cardService.createCard(req.body)
    }, res, 201)
  }

  createManyCards = async (req, res) => {
    await this.executeAction(async () => {
      const { cards } = req.body
      if (!Array.isArray(cards)) {
        return Result.failure(new Error('Cards must be an array'))
      }

      if (cards.length === 0) {
        return Result.failure(new Error('Cards array cannot be empty'))
      }

      return await this.cardService.createManyCards(cards)
    }, res, 201)
  }
}

module.exports = new CardController()
