const BaseRepository = require('../core/repositories/BaseRepository')
const Result = require('../core/errors/Result')

/**
 * Game Score Repository - Handles game score data access
 */
class GameScoreRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, 'GameScore')
  }

  /**
   * Find score by game and participant
   * @param {number} gameId - Game ID
   * @param {number} participantId - Participant ID
   * @returns {Promise<Result>} Result containing score
   */
  async findByGameAndParticipant(gameId, participantId) {
    return Result.fromAsync(async () => {
      const score = await this.getRepository().findOne({
        where: { gameId, participantId }
      })
      if (!score) {
        throw new Error('Score not found')
      }
      return score
    })
  }

  /**
   * Find all scores for a game
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing scores
   */
  async findByGame(gameId) {
    return Result.fromAsync(async () => {
      const scores = await this.getRepository().find({
        where: { gameId },
        order: { score: 'DESC' }
      })
      return scores
    })
  }

  /**
   * Update score
   * @param {number} gameId - Game ID
   * @param {number} participantId - Participant ID
   * @param {number} score - New score
   * @returns {Promise<Result>} Result containing updated score
   */
  async updateScore(gameId, participantId, score) {
    return Result.fromAsync(async () => {
      const existingScore = await this.getRepository().findOne({
        where: { gameId, participantId }
      })

      if (existingScore) {
        existingScore.score = score
        return await this.getRepository().save(existingScore)
      } else {
        const newScore = this.getRepository().create({
          gameId,
          participantId,
          score
        })
        return await this.getRepository().save(newScore)
      }
    })
  }

  /**
   * Get top scores
   * @param {number} limit - Number of top scores to return
   * @returns {Promise<Result>} Result containing top scores
   */
  async getTopScores(limit = 10) {
    return Result.fromAsync(async () => {
      const scores = await this.getRepository().find({
        order: { score: 'DESC' },
        take: limit,
        relations: ['participant', 'game']
      })
      return scores
    })
  }

  /**
   * Delete scores for a game
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing deletion result
   */
  async deleteByGame(gameId) {
    return Result.fromAsync(async () => {
      const result = await this.getRepository().delete({ gameId })
      return result
    })
  }
}

module.exports = GameScoreRepository
