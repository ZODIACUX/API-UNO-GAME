const cardRepository = require('../repositories/cardRepository')
const { ApiError } = require('../utils-api/responseHelper')

class CardService {
  constructor() {
    this.cardRepository = cardRepository
  }

  async getCardById(id) {
    const card = await this.cardRepository.findById(id)
    if (!card) {
      throw new ApiError('Card not found', 404)
    }
    return card
  }

  async getCardsByType(type) {
    const validTypes = ['number', 'action', 'wild']
    if (!validTypes.includes(type)) {
      throw new ApiError('Invalid card type', 400)
    }
    return await this.cardRepository.findByType(type)
  }

  async getCardsByColor(color) {
    const validColors = ['red', 'blue', 'green', 'yellow', 'black']
    if (!validColors.includes(color)) {
      throw new ApiError('Invalid card color', 400)
    }
    return await this.cardRepository.findByColor(color)
  }

  async getAllCards() {
    return await this.cardRepository.findAll()
  }

  async createCard(cardData) {
    // Validar datos de la carta
    this.validateCardData(cardData)
    try {
      return await this.cardRepository.create(cardData)
    } catch (error) {
      console.error('Error creating card:', error)
      throw new ApiError('Error creating card', 500)
    }
  }

  async createManyCards(cardsData) {
    // Validar datos de todas las cartas
    cardsData.forEach(cardData => this.validateCardData(cardData))
    try {
      return await this.cardRepository.createMany(cardsData)
    } catch (error) {
      console.error('Error creating multiple cards:', error)
      throw new ApiError('Error creating cards', 500)
    }
  }

  validateCardData(cardData) {
    const validTypes = ['number', 'action', 'wild']
    const validColors = ['red', 'blue', 'green', 'yellow', 'black']
    const validValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four']

    if (!cardData.type || !validTypes.includes(cardData.type)) {
      throw new ApiError('Invalid card type', 400)
    }

    if (!cardData.color || !validColors.includes(cardData.color)) {
      throw new ApiError('Invalid card color', 400)
    }

    if (!cardData.value || !validValues.includes(cardData.value)) {
      throw new ApiError('Invalid card value', 400)
    }
  }
}

module.exports = new CardService()
