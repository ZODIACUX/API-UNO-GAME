const BaseRepository = require('../core/repositories/BaseRepository')
const { GameParticipant } = require('../models/GameParticipant')
const Result = require('../core/errors/Result')

/**
 * Game Participant Repository - Implements DIP and LSP
 * Dependency Inversion: Depends on IRepository interface
 * Liskov Substitution: Can substitute BaseRepository anywhere it's expected
 */
class GameParticipantRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, GameParticipant)
  }

  /**
   * Find participants by game ID
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing participants or error
   */
  async findByGameId(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const participants = await this.getRepository().find({
        where: { gameId },
        relations: ['user'],
        order: { joinedAt: 'ASC' }
      })

      return participants
    })
  }

  /**
   * Find participant by game and user ID
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing participant or error
   */
  async findByGameAndUserId(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const participant = await this.getRepository().findOne({
        where: { gameId, userId },
        relations: ['user', 'game']
      })

      return participant
    })
  }

  /**
   * Update participant ready status
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @param {boolean} isReady - Ready status
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateReadyStatus(gameId, userId, isReady) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const result = await this.getRepository().update(
        { gameId, userId },
        { isReady, readyAt: isReady ? new Date() : null }
      )

      return result
    })
  }

  /**
   * Update participant score
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @param {number} score - New score
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateScore(gameId, userId, score) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      if (typeof score !== 'number' || score < 0) {
        throw new Error('Score must be a non-negative number')
      }

      const result = await this.getRepository().update(
        { gameId, userId },
        { score }
      )

      return result
    })
  }

  /**
   * Get game leaderboard
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing leaderboard or error
   */
  async getLeaderboard(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const participants = await this.getRepository().find({
        where: { gameId },
        relations: ['user'],
        order: { score: 'DESC' }
      })

      const leaderboard = participants.map((participant, index) => ({
        rank: index + 1,
        username: participant.username,
        score: participant.score,
        isReady: participant.isReady
      }))

      return leaderboard
    })
  }

  /**
   * Remove participant from game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async removeParticipant(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const result = await this.getRepository().delete({
        gameId,
        userId
      })

      return result
    })
  }
}

module.exports = GameParticipantRepository
