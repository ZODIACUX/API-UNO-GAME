const BaseRepository = require('../core/repositories/BaseRepository')
const { UnoGame } = require('../models/UnoGame')
const Result = require('../core/errors/Result')

/**
 * Game Repository - Implements DIP and LSP
 * Dependency Inversion: Depends on IGameRepository interface
 * Liskov Substitution: Can substitute BaseRepository anywhere it's expected
 */
class GameRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, UnoGame)
  }

  /**
   * Find games by creator ID - IGameRepository implementation
   * @param {number} creatorId - Creator user ID
   * @returns {Promise<Result>} Result containing games or error
   */
  async findByCreatorId(creatorId) {
    return Result.fromAsync(async () => {
      if (!creatorId) {
        throw new Error('Creator ID is required')
      }

      const games = await this.getRepository().find({
        where: { creatorId },
        relations: ['creator', 'players', 'players.user'],
        order: { createdAt: 'DESC' }
      })

      return games
    })
  }

  /**
   * Find games by status - IGameRepository implementation
   * @param {string} status - Game status (waiting, in_progress, finished)
   * @returns {Promise<Result>} Result containing games or error
   */
  async findByStatus(status) {
    return Result.fromAsync(async () => {
      if (!status) {
        throw new Error('Status is required')
      }

      const validStatuses = ['waiting', 'in_progress', 'finished']
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`)
      }

      const games = await this.getRepository().find({
        where: { status },
        relations: ['creator', 'players', 'players.user'],
        order: { createdAt: 'DESC' }
      })

      return games
    })
  }

  /**
   * Find active games - IGameRepository implementation
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing active games or error
   */
  async findActiveGames(options = {}) {
    return Result.fromAsync(async () => {
      const { limit, offset } = options
      const queryOptions = {
        where: [
          { status: 'waiting' },
          { status: 'in_progress' }
        ],
        relations: ['creator', 'players', 'players.user'],
        order: { createdAt: 'DESC' }
      }

      if (limit) queryOptions.take = limit
      if (offset) queryOptions.skip = offset

      const games = await this.getRepository().find(queryOptions)
      return games
    })
  }

  /**
   * Update game status - IGameRepository implementation
   * @param {number} gameId - Game ID
   * @param {string} status - New status
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateGameStatus(gameId, status) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }
      if (!status) {
        throw new Error('Status is required')
      }

      const validStatuses = ['waiting', 'in_progress', 'finished']
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`)
      }

      const result = await this.getRepository().update(gameId, { status })
      return result
    })
  }

  /**
   * Update current player - IGameRepository implementation
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateCurrentPlayer(gameId, playerId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const result = await this.getRepository().update(gameId, {
        currentPlayerId: playerId
      })

      return result
    })
  }

  /**
   * Update game direction - IGameRepository implementation
   * @param {number} gameId - Game ID
   * @param {string} direction - Game direction (clockwise, counterclockwise)
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateDirection(gameId, direction) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }
      if (!direction) {
        throw new Error('Direction is required')
      }

      const validDirections = ['clockwise', 'counterclockwise']
      if (!validDirections.includes(direction)) {
        throw new Error(`Invalid direction: ${direction}`)
      }

      const result = await this.getRepository().update(gameId, { direction })
      return result
    })
  }

  /**
   * Find games with player count - IGameRepository implementation
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Result>} Result containing games with player counts or error
   */
  async findGamesWithPlayerCount(limit = 10) {
    return Result.fromAsync(async () => {
      const games = await this.getRepository()
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.players', 'players')
        .leftJoinAndSelect('game.creator', 'creator')
        .select([
          'game.id',
          'game.name',
          'game.status',
          'game.createdAt',
          'creator.username',
          'COUNT(players.id) as playerCount'
        ])
        .groupBy('game.id')
        .addGroupBy('creator.username')
        .orderBy('playerCount', 'DESC')
        .limit(limit)
        .getRawMany()

      return games
    })
  }

  /**
   * Find game with full details - IGameRepository implementation
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing game with full details or error
   */
  async findWithFullDetails(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const game = await this.getRepository().findOne({
        where: { id: gameId },
        relations: [
          'creator',
          'players',
          'players.user',
          'cards',
          'cards.card'
        ]
      })

      if (!game) {
        throw new Error(`Game with id ${gameId} not found`)
      }

      return game
    })
  }

  /**
   * Override create to set default values - LSP compliance
   * @param {Object} data - Game data
   * @returns {Promise<Result>} Result containing created game or error
   */
  async create(data) {
    return Result.fromAsync(async () => {
      if (!data) {
        throw new Error('Game data is required')
      }

      // Set default values
      const gameData = {
        ...data,
        status: data.status || 'waiting',
        direction: data.direction || 'clockwise',
        maxPlayers: data.maxPlayers || 4
      }

      const entity = this.getRepository().create(gameData)
      const savedEntity = await this.getRepository().save(entity)

      return savedEntity
    })
  }

  /**
   * Override update to handle game-specific fields - LSP compliance
   * @param {number|string} id - Game ID
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing updated game or error
   */
  async update(id, data) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('Game ID is required')
      }
      if (!data) {
        throw new Error('Update data is required')
      }

      // Validate status if provided
      if (data.status) {
        const validStatuses = ['waiting', 'in_progress', 'finished']
        if (!validStatuses.includes(data.status)) {
          throw new Error(`Invalid status: ${data.status}`)
        }
      }

      // Validate direction if provided
      if (data.direction) {
        const validDirections = ['clockwise', 'counterclockwise']
        if (!validDirections.includes(data.direction)) {
          throw new Error(`Invalid direction: ${data.direction}`)
        }
      }

      await this.getRepository().update(id, data)
      const entity = await this.getRepository().findOne({ where: { id } })

      if (!entity) {
        throw new Error(`Game with id ${id} not found after update`)
      }

      return entity
    })
  }
}

module.exports = GameRepository
