const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Card Service - Implements SRP (Single Responsibility Principle)
 * Handles card-related operations only
 */
class CardService extends BaseService {
  constructor(cardRepository, gameRepository) {
    super(cardRepository)
    this.gameRepository = gameRepository
  }

  /**
   * Create a new card
   * @param {Object} cardData - Card data
   * @returns {Promise<Result>} Result containing created card
   */
  async createCard(cardData) {
    return Result.fromAsync(async () => {
      const result = await this.repository.create(cardData)
      if (!result.isSuccess) {
        throw result.error
      }
      return result.value
    })
  }

  /**
   * Get all cards
   * @returns {Promise<Result>} Result containing all cards
   */
  async getAllCards() {
    return Result.fromAsync(async () => {
      const result = await this.repository.findAll()
      if (!result.isSuccess) {
        throw result.error
      }
      return result.value
    })
  }

  /**
   * Get card by ID
   * @param {number} cardId - Card ID
   * @returns {Promise<Result>} Result containing card
   */
  async getCardById(cardId) {
    return Result.fromAsync(async () => {
      const result = await this.repository.findById(cardId)
      if (!result.isSuccess) {
        throw result.error
      }
      return result.value
    })
  }

  /**
   * Update card
   * @param {number} cardId - Card ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Result>} Result containing updated card
   */
  async updateCard(cardId, updateData) {
    return Result.fromAsync(async () => {
      const result = await this.repository.update(cardId, updateData)
      if (!result.isSuccess) {
        throw result.error
      }
      return result.value
    })
  }

  /**
   * Delete card
   * @param {number} cardId - Card ID
   * @returns {Promise<Result>} Result containing deletion result
   */
  async deleteCard(cardId) {
    return Result.fromAsync(async () => {
      const result = await this.repository.delete(cardId)
      if (!result.isSuccess) {
        throw result.error
      }
      return result.value
    })
  }

  /**
   * Validate card play
   * @param {Object} card - Card to play
   * @param {Object} topCard - Top card on discard pile
   * @param {Object} gameState - Current game state
   * @returns {boolean} True if card can be played
   */
  validateCardPlay(card, topCard, _gameState) {
    // Wild cards can always be played
    if (card.color === 'wild' || card.color === 'black') {
      return true
    }

    // Must match color or value
    return card.color === topCard.color || card.value === topCard.value
  }

  /**
   * Apply card effects to game state
   * @param {Object} gameState - Current game state
   * @param {Object} card - Card being played
   * @param {Object} player - Player playing the card
   * @returns {Promise<Result>} Result containing effects
   */
  async applyCardEffects(gameState, card, player) {
    return Result.fromAsync(async () => {
      const effects = []

      switch (card.value) {
      case 'skip':
        effects.push({
          type: 'skip_player',
          targetPlayer: this.getNextPlayer(gameState, player)
        })
        break

      case 'reverse':
        effects.push({
          type: 'reverse_direction',
          newDirection: gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise'
        })
        break

      case 'draw_two':
        effects.push({
          type: 'draw_cards',
          targetPlayer: this.getNextPlayer(gameState, player),
          cardCount: 2
        })
        break

      case 'wild_draw_four':
        effects.push({
          type: 'draw_cards',
          targetPlayer: this.getNextPlayer(gameState, player),
          cardCount: 4
        })
        break
      }

      return effects
    })
  }

  /**
   * Get next player in turn order
   * @param {Object} gameState - Current game state
   * @param {Object} currentPlayer - Current player
   * @returns {Object} Next player
   */
  getNextPlayer(gameState, currentPlayer) {
    const players = gameState.players || []
    const currentIndex = players.findIndex(p => p.id === currentPlayer.id)
    const direction = gameState.direction || 'clockwise'

    if (direction === 'clockwise') {
      return players[(currentIndex + 1) % players.length]
    } else {
      return players[(currentIndex - 1 + players.length) % players.length]
    }
  }

  /**
   * Generate standard UNO deck
   * @returns {Array} Array of card objects
   */
  generateDeck() {
    const colors = ['Red', 'Blue', 'Green', 'Yellow']
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    const specials = ['Skip', 'Reverse', 'Draw Two']
    const deck = []

    // Add number cards
    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push({ color, value: number, type: 'number' })
        if (number !== '0') {
          deck.push({ color, value: number, type: 'number' }) // Two of each number except 0
        }
      })

      // Add special cards
      specials.forEach(special => {
        deck.push({ color, value: special, type: 'special' })
        deck.push({ color, value: special, type: 'special' })
      })
    })

    // Add wild cards
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'wild', value: 'Wild', type: 'wild' })
      deck.push({ color: 'wild', value: 'Wild Draw Four', type: 'wild' })
    }

    return this.shuffleDeck(deck)
  }

  /**
   * Shuffle deck
   * @param {Array} deck - Deck to shuffle
   * @returns {Array} Shuffled deck
   */
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }

  /**
   * Get card points for scoring
   * @param {Object} card - Card object
   * @returns {number} Points value
   */
  getCardPoints(card) {
    if (card.color === 'wild') {
      return card.value === 'Wild Draw Four' ? 50 : 40
    }

    switch (card.value) {
    case 'Skip':
    case 'Reverse':
    case 'Draw Two':
      return 20
    default:
      return parseInt(card.value) || 0
    }
  }
}

module.exports = CardService
