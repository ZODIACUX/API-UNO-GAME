const BaseService = require('../core/services/BaseService')
const Result = require('../core/errors/Result')

class CardService extends BaseService {
  constructor(cardRepository) {
    super(cardRepository)
    this.validTypes = ['number', 'action', 'wild']
    this.validColors = ['red', 'blue', 'green', 'yellow', 'black']
    this.validValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four']
  }

  async getCardsByType(type) {
    return Result.fromAsync(async () => {
      if (!this.validTypes.includes(type)) {
        throw new Error('Invalid card type')
      }

      const result = await this.repository.findByType(type)
      if (!result.isSuccess) {
        throw new Error('Failed to retrieve cards by type')
      }

      return result.value
    })
  }

  async getCardsByColor(color) {
    return Result.fromAsync(async () => {
      if (!this.validColors.includes(color)) {
        throw new Error('Invalid card color')
      }

      const result = await this.repository.findByColor(color)
      if (!result.isSuccess) {
        throw new Error('Failed to retrieve cards by color')
      }

      return result.value
    })
  }

  async createManyCards(cardsData) {
    return Result.fromAsync(async () => {
      if (!Array.isArray(cardsData) || cardsData.length === 0) {
        throw new Error('Cards data must be a non-empty array')
      }

      for (const cardData of cardsData) {
        const validationResult = this.validateData(cardData)
        if (!validationResult.isSuccess) {
          throw validationResult.error
        }
      }

      const result = await this.repository.createMany(cardsData)
      if (!result.isSuccess) {
        throw new Error('Failed to create cards')
      }

      return result.value
    })
  }

  validateData(cardData) {
    if (!cardData || typeof cardData !== 'object') {
      return Result.failure(new Error('Card data is required and must be an object'))
    }

    if (!cardData.type || !this.validTypes.includes(cardData.type)) {
      return Result.failure(new Error(`Invalid card type. Must be one of: ${this.validTypes.join(', ')}`))
    }

    if (!cardData.color || !this.validColors.includes(cardData.color)) {
      return Result.failure(new Error(`Invalid card color. Must be one of: ${this.validColors.join(', ')}`))
    }

    if (!cardData.value || !this.validValues.includes(cardData.value)) {
      return Result.failure(new Error(`Invalid card value. Must be one of: ${this.validValues.join(', ')}`))
    }

    return Result.success(cardData)
  }

  validateUpdateData(cardData) {
    return this.validateData(cardData)
  }
}

module.exports = CardService
