const BaseRepository = require('../core/repositories/BaseRepository')
const { Card } = require('../models/Card')
const Result = require('../core/errors/Result')

/**
 * Card Repository - Implements DIP and LSP
 * Dependency Inversion: Depends on IRepository interface
 * Liskov Substitution: Can substitute BaseRepository anywhere it's expected
 */
class CardRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, Card)
  }

  /**
   * Find cards by game ID
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing cards or error
   */
  async findByGameId(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const cards = await this.getRepository().find({
        where: { gameId },
        order: { createdAt: 'ASC' }
      })

      return cards
    })
  }

  /**
   * Find cards by player ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing cards or error
   */
  async findByPlayerId(playerId) {
    return Result.fromAsync(async () => {
      if (!playerId) {
        throw new Error('Player ID is required')
      }

      const cards = await this.getRepository().find({
        where: { playerId },
        order: { createdAt: 'ASC' }
      })

      return cards
    })
  }

  /**
   * Shuffle deck
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing shuffled cards or error
   */
  async shuffleDeck(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const cards = await this.getRepository().find({
        where: { gameId, location: 'deck' }
      })

      // Simple shuffle algorithm
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]]
      }

      // Update shuffled order
      for (let i = 0; i < cards.length; i++) {
        await this.getRepository().update(cards[i].id, { order: i })
      }

      return cards
    })
  }
}

module.exports = CardRepository
