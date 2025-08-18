const BaseService = require('./BaseService')
const Result = require('../errors/Result')

class GameService extends BaseService {
  constructor(gameRepository, userRepository) {
    super(gameRepository)
    this.userRepository = userRepository
  }

  async createGame(gameData, creatorId) {
    return Result.fromAsync(async () => {
      if (!creatorId) {
        throw new Error('Creator ID is required')
      }

      const { name, rules, maxPlayers } = gameData

      if (!name || name.trim().length === 0) {
        throw new Error('Game name is required')
      }

      const game = await this.repository.create({
        name: name.trim(),
        rules: rules || {},
        maxPlayers: maxPlayers || 4,
        creatorId
      })

      if (!game.isSuccess) {
        throw new Error('Failed to create game')
      }

      await this.repository.addPlayerToGame(creatorId, game.value.id, 1)

      return game.value
    })
  }

  async joinGame(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value

      if (game.status !== 'waiting') {
        throw new Error('Game is not accepting new players')
      }

      const existingPlayer = await this.repository.findPlayerInGame(userId, gameId)
      if (existingPlayer) {
        throw new Error('User already in game')
      }

      const currentPlayers = await this.repository.getPlayerCount(gameId)
      if (currentPlayers >= game.maxPlayers) {
        throw new Error('Game is full')
      }

      await this.repository.addPlayerToGame(userId, gameId, currentPlayers + 1)
      return game
    })
  }

  async startGame(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value

      if (game.creatorId !== userId) {
        throw new Error('Only game creator can start the game')
      }

      if (game.status !== 'waiting') {
        throw new Error('Game cannot be started')
      }

      const players = await this.repository.getGamePlayers(gameId)
      if (players.length < 2) {
        throw new Error('Need at least 2 players to start')
      }

      const allReady = players.every(player => player.isReady)
      if (!allReady) {
        throw new Error('Not all players are ready')
      }

      await this.repository.update(gameId, {
        status: 'in_progress',
        currentPlayerId: players[0].userId
      })

      return game
    })
  }

  async leaveGame(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      const gamePlayer = await this.repository.findPlayerInGame(userId, gameId)

      if (!gamePlayer) {
        throw new Error('User not in game')
      }

      await this.repository.removePlayerFromGame(userId, gameId)

      if (game.creatorId === userId && game.status === 'waiting') {
        await this.repository.delete(gameId)
      }

      return game
    })
  }

  async endGame(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value

      if (game.creatorId !== userId) {
        throw new Error('Only game creator can end the game')
      }

      await this.repository.update(gameId, { status: 'finished' })
      return game
    })
  }

  async getGameState(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      return {
        game_id: gameId,
        state: gameResult.value.status
      }
    })
  }

  async getGamePlayers(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const players = await this.repository.getGamePlayers(gameId)
      const playerNames = players.map(player => player.User.username)

      return {
        game_id: gameId,
        players: playerNames
      }
    })
  }

  async getCurrentPlayer(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      let currentPlayer = null

      if (game.currentPlayerId) {
        const userResult = await this.userRepository.findById(game.currentPlayerId)
        if (userResult.isSuccess) {
          currentPlayer = userResult.value.username
        }
      }

      return {
        game_id: gameId,
        current_player: currentPlayer
      }
    })
  }

  validateData(data) {
    const { name, maxPlayers } = data

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Result.failure(new Error('Game name is required and must be a non-empty string'))
    }

    if (maxPlayers && (typeof maxPlayers !== 'number' || maxPlayers < 2 || maxPlayers > 8)) {
      return Result.failure(new Error('Max players must be a number between 2 and 8'))
    }

    return Result.success(data)
  }
}

module.exports = GameService
