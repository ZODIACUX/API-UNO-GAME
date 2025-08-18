const BaseController = require('../core/controllers/BaseController')
const ServiceRegistration = require('../core/di/ServiceRegistration')
const Result = require('../core/errors/Result')

class CardController extends BaseController {
  constructor() {
    super()
    this.cardService = ServiceRegistration.getService('cardService')
  }

  getCard = async (req, res) => {
    await this.executeAction(async () => {
      const { id } = req.params
      if (!id) {
        return Result.failure(new Error('Card ID is required'))
      }

      return await this.cardService.getById(id)
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
      return await this.cardService.getAll()
    }, res)
  }

  createCard = async (req, res) => {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['type', 'color', 'value'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      return await this.cardService.create(req.body)
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
