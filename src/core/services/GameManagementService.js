const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Game Management Service - Implements SRP (Single Responsibility Principle)
 * Handles game lifecycle management operations only
 */
class GameManagementService extends BaseService {
  constructor(gameRepository, gameParticipantRepository) {
    super(gameRepository)
    this.gameParticipantRepository = gameParticipantRepository
  }

  /**
   * Create a new game
   * @param {string} name - Game name
   * @param {number} creatorId - Creator user ID
   * @param {number} maxPlayers - Maximum number of players
   * @returns {Promise<Result>} Result containing created game
   */
  async createGame(name, creatorId, maxPlayers = 4) {
    return Result.fromAsync(async () => {
      const gameData = {
        name,
        creatorId,
        maxPlayers,
        status: 'waiting',
        currentDirection: 'clockwise',
        currentPlayer: null,
        currentColor: null,
        currentValue: null
      }

      const result = await this.repository.create(gameData)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Join an existing game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @param {string} username - Username
   * @returns {Promise<Result>} Result containing join result
   */
  async joinGame(gameId, userId, username) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.status !== 'waiting') {
        throw new Error('Game already started')
      }

      // Check if user is already in game
      const existingParticipant = await this.gameParticipantRepository.findOne({
        gameId,
        userId
      })

      if (existingParticipant.isSuccess) {
        throw new Error('User already in game')
      }

      // Add participant
      const participantResult = await this.gameParticipantRepository.create({
        gameId,
        userId,
        username,
        isReady: false,
        score: 0,
        cards: []
      })

      if (!participantResult.isSuccess) {
        throw participantResult.error
      }

      return { message: 'User joined the game successfully' }
    })
  }

  /**
   * Start the game when all players are ready
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID (must be creator)
   * @returns {Promise<Result>} Result containing start result
   */
  async startGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.creatorId !== userId) {
        throw new Error('Only game creator can start the game')
      }

      // Get all participants
      const participantsResult = await this.gameParticipantRepository.findBy({ gameId })
      if (!participantsResult.isSuccess || participantsResult.value.length < 2) {
        throw new Error('Need at least 2 players to start')
      }

      // Check if all players are ready
      const notReadyPlayers = participantsResult.value.filter(p => !p.isReady)
      if (notReadyPlayers.length > 0) {
        throw new Error('All players must be ready to start')
      }

      // Update game status
      const updateResult = await this.repository.update(gameId, {
        status: 'in_progress',
        currentPlayerId: participantsResult.value[0].userId
      })

      if (!updateResult.isSuccess) {
        throw updateResult.error
      }

      return { message: 'Game started successfully' }
    })
  }

  /**
   * End a game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID (must be creator)
   * @returns {Promise<Result>} Result containing end result
   */
  async endGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.creatorId !== userId) {
        throw new Error('Only game creator can end the game')
      }

      const updateResult = await this.repository.update(gameId, {
        status: 'finished'
      })

      if (!updateResult.isSuccess) {
        throw updateResult.error
      }

      return { message: 'Game ended successfully' }
    })
  }

  /**
   * Leave a game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing leave result
   */
  async leaveGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const participantResult = await this.gameParticipantRepository.findOne({
        gameId,
        userId
      })

      if (!participantResult.isSuccess) {
        throw new Error('User not in game')
      }

      const deleteResult = await this.gameParticipantRepository.delete(participantResult.value.id)
      if (!deleteResult.isSuccess) {
        throw deleteResult.error
      }

      return { message: 'User left the game successfully' }
    })
  }

  /**
   * Get game state
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing game state
   */
  async getGameState(gameId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      const participantsResult = await this.gameParticipantRepository.findBy({ gameId })

      return {
        gameId: game.id,
        name: game.name,
        status: game.status,
        creatorId: game.creatorId,
        maxPlayers: game.maxPlayers,
        currentPlayer: game.currentPlayerId,
        players: participantsResult.isSuccess ? participantsResult.value : []
      }
    })
  }

  /**
   * Get game players
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing players list
   */
  async getGamePlayers(gameId) {
    return Result.fromAsync(async () => {
      const participantsResult = await this.gameParticipantRepository.findBy({ gameId })
      if (!participantsResult.isSuccess) {
        throw new Error('Game not found')
      }

      const players = participantsResult.value.map(p => p.username)
      return {
        gameId,
        players
      }
    })
  }
}

module.exports = GameManagementService
