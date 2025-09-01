const { AppDataSource } = require('../config/data-source')
const { UnoGame } = require('../models/UnoGame')
const { GamePlayer } = require('../models/GamePlayer')
const { User } = require('../models/User')
const Result = require('../utils/Result')

class GameService {
  constructor() {
    this.gameRepository = AppDataSource.getRepository(UnoGame)
    this.gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
    this.userRepository = AppDataSource.getRepository(User)
  }

  async createGame(gameData) {
    return Result.fromAsync(async () => {
      const { name, creatorId, maxPlayers = 4 } = gameData

      if (!name || !creatorId) {
        throw new Error('Game name and creator ID are required')
      }

      const game = this.gameRepository.create({
        name,
        creatorId,
        maxPlayers,
        status: 'waiting',
        currentPlayerIndex: 0
      })

      return await this.gameRepository.save(game)
    })
  }

  async getGameState(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const game = await this.gameRepository.findOne({
        where: { id: gameId },
        relations: ['players', 'players.user']
      })

      if (!game) {
        throw new Error('Game not found')
      }

      return {
        game_id: gameId,
        status: game.status,
        current_player: game.currentPlayerIndex,
        players: game.players.map(p => p.user.username),
        top_card: game.topCard || 'No card'
      }
    })
  }

  async getTopCard(gameId) {
    return this.getGameState(gameId).then(result => {
      if (!result.isSuccess) {
        return result
      }

      return Result.success({
        game_id: gameId,
        top_card: result.value.topCard || 'No card'
      })
    })
  }

  async getScores(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const players = await this.gamePlayerRepository.find({
        where: { gameId },
        relations: ['user'],
        order: { position: 'ASC' }
      })

      const scores = {}
      players.forEach(player => {
        scores[player.user.username] = player.score || 0
      })

      return {
        game_id: gameId,
        scores
      }
    })
  }

  async joinGame(gameId, userId) {
    return Result.fromAsync(async () => {
      if (!gameId || !userId) {
        throw new Error('Game ID and User ID are required')
      }

      const game = await this.gameRepository.findOne({
        where: { id: gameId },
        relations: ['players']
      })

      if (!game) {
        throw new Error('Game not found')
      }

      if (game.status !== 'waiting') {
        throw new Error('Game is not accepting new players')
      }

      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full')
      }

      // Check if user is already in the game
      const existingPlayer = await this.gamePlayerRepository.findOne({
        where: { gameId, userId }
      })

      if (existingPlayer) {
        throw new Error('User is already in this game')
      }

      const gamePlayer = this.gamePlayerRepository.create({
        gameId,
        userId,
        position: game.players.length,
        isReady: false
      })

      return await this.gamePlayerRepository.save(gamePlayer)
    })
  }

  async startGame(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const game = await this.gameRepository.findOne({
        where: { id: gameId },
        relations: ['players']
      })

      if (!game) {
        throw new Error('Game not found')
      }

      if (game.status !== 'waiting') {
        throw new Error('Game cannot be started')
      }

      if (game.players.length < 2) {
        throw new Error('Need at least 2 players to start the game')
      }

      await this.gameRepository.update(gameId, {
        status: 'in_progress',
        startedAt: new Date()
      })

      return await this.gameRepository.findOne({ where: { id: gameId } })
    })
  }
}

module.exports = GameService
