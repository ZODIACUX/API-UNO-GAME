const BaseRepository = require('../core/repositories/BaseRepository')
const Result = require('../core/errors/Result')

/**
 * UNO Game Repository - Handles UNO game data access
 */
class UnoGameRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, 'UnoGame')
  }

  /**
   * Find games by status
   * @param {string} status - Game status
   * @returns {Promise<Result>} Result containing games
   */
  async findByStatus(status) {
    return Result.fromAsync(async () => {
      const games = await this.getRepository().find({
        where: { status },
        relations: ['creator', 'participants']
      })
      return games
    })
  }

  /**
   * Find games by creator
   * @param {number} creatorId - Creator ID
   * @returns {Promise<Result>} Result containing games
   */
  async findByCreator(creatorId) {
    return Result.fromAsync(async () => {
      const games = await this.getRepository().find({
        where: { creatorId },
        relations: ['creator', 'participants'],
        order: { createdAt: 'DESC' }
      })
      return games
    })
  }

  /**
   * Find active games (waiting or in progress)
   * @returns {Promise<Result>} Result containing active games
   */
  async findActiveGames() {
    return Result.fromAsync(async () => {
      const games = await this.getRepository().find({
        where: [
          { status: 'waiting' },
          { status: 'in_progress' }
        ],
        relations: ['creator', 'participants']
      })
      return games
    })
  }

  /**
   * Update game status
   * @param {number} gameId - Game ID
   * @param {string} status - New status
   * @returns {Promise<Result>} Result containing updated game
   */
  async updateStatus(gameId, status) {
    return Result.fromAsync(async () => {
      const game = await this.getRepository().findOne({ where: { id: gameId } })
      if (!game) {
        throw new Error('Game not found')
      }

      game.status = status
      return await this.getRepository().save(game)
    })
  }

  /**
   * Update current player
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing updated game
   */
  async updateCurrentPlayer(gameId, playerId) {
    return Result.fromAsync(async () => {
      const game = await this.getRepository().findOne({ where: { id: gameId } })
      if (!game) {
        throw new Error('Game not found')
      }

      game.currentPlayerId = playerId
      return await this.getRepository().save(game)
    })
  }

  /**
   * Update game direction
   * @param {number} gameId - Game ID
   * @param {string} direction - New direction
   * @returns {Promise<Result>} Result containing updated game
   */
  async updateDirection(gameId, direction) {
    return Result.fromAsync(async () => {
      const game = await this.getRepository().findOne({ where: { id: gameId } })
      if (!game) {
        throw new Error('Game not found')
      }

      game.currentDirection = direction
      return await this.getRepository().save(game)
    })
  }

  /**
   * Get games with player count
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Result>} Result containing games with player counts
   */
  async findGamesWithPlayerCount(limit = 10) {
    return Result.fromAsync(async () => {
      const games = await this.getRepository()
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.participants', 'participant')
        .loadRelationCountAndMap('game.playerCount', 'game.participants')
        .take(limit)
        .getMany()

      return games
    })
  }

  /**
   * Find game with full details
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing game with full details
   */
  async findWithFullDetails(gameId) {
    return Result.fromAsync(async () => {
      const game = await this.getRepository().findOne({
        where: { id: gameId },
        relations: ['creator', 'participants', 'scores', 'cards']
      })

      if (!game) {
        throw new Error('Game not found')
      }

      return game
    })
  }

  /**
   * Delete game and related data
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing deletion result
   */
  async deleteWithRelations(gameId) {
    return Result.fromAsync(async () => {
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        // Delete related data first
        await queryRunner.manager.delete('GameScore', { gameId })
        await queryRunner.manager.delete('GameParticipant', { gameId })
        await queryRunner.manager.delete('GameCard', { gameId })

        // Delete the game
        const result = await queryRunner.manager.delete('UnoGame', { id: gameId })

        await queryRunner.commitTransaction()
        return result
      } catch (error) {
        await queryRunner.rollbackTransaction()
        throw error
      } finally {
        await queryRunner.release()
      }
    })
  }
}

module.exports = UnoGameRepository
