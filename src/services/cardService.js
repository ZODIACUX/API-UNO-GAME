const { AppDataSource } = require('../config/data-source')
const { Card } = require('../models/Card')
const { IsNull } = require('typeorm')
const Result = require('../utils/Result')

class CardService {
  constructor() {
    this.cardRepository = AppDataSource.getRepository(Card)
    this.validTypes = ['number', 'action', 'wild']
    this.validColors = ['red', 'blue', 'green', 'yellow', 'black']
    this.validValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four']
  }

  async getAllCards() {
    return Result.fromAsync(async () => {
      return await this.cardRepository.find()
    })
  }

  async getCardById(id) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('Card ID is required')
      }

      const card = await this.cardRepository.findOne({ where: { id } })
      if (!card) {
        throw new Error('Card not found')
      }

      return card
    })
  }

  async getCardsByType(type) {
    return Result.fromAsync(async () => {
      if (!this.validTypes.includes(type)) {
        throw new Error('Invalid card type')
      }

      return await this.cardRepository.find({ where: { type } })
    })
  }

  async getCardsByColor(color) {
    return Result.fromAsync(async () => {
      if (!this.validColors.includes(color)) {
        throw new Error('Invalid card color')
      }

      return await this.cardRepository.find({ where: { color } })
    })
  }

  async getCardsByValue(value) {
    return Result.fromAsync(async () => {
      return await this.cardRepository.find({
        where: { value: value === null ? IsNull() : value }
      })
    })
  }

  async createCard(cardData) {
    return Result.fromAsync(async () => {
      const validationResult = this.validateData(cardData)
      if (!validationResult.isSuccess) {
        throw validationResult.error
      }

      const card = this.cardRepository.create(cardData)
      return await this.cardRepository.save(card)
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

      const cards = this.cardRepository.create(cardsData)
      return await this.cardRepository.save(cards)
    })
  }

  async findCardsByTypeAndColor(type, color) {
    return Result.fromAsync(async () => {
      if (!type || !color) {
        throw new Error('Both type and color parameters are required')
      }

      if (!this.validTypes.includes(type)) {
        throw new Error('Invalid card type')
      }

      if (!this.validColors.includes(color)) {
        throw new Error('Invalid card color')
      }

      return await this.cardRepository.find({ where: { type, color } })
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
