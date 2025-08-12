const gamePlayerRepository = require('../repositories/gamePlayerRepository')
const { UnoGame } = require('../entities/UnoGame')
const { AppDataSource } = require('../database/data-source')
const { ApiError } = require('../utils-api/responseHelper')

class GamePlayerService {
  constructor() {
    this.gamePlayerRepository = gamePlayerRepository
  }

  async joinGame(userId, gameId) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new ApiError('Game not found', 404)
    }

    if (game.status !== 'waiting') {
      throw new ApiError('Game is not in waiting status', 400)
    }

    // Verificar si el jugador ya está en el juego
    const existingPlayer = await this.gamePlayerRepository.findByGameAndUser(gameId, userId)
    if (existingPlayer) {
      throw new ApiError('Player is already in the game', 400)
    }

    // Obtener la siguiente posición disponible
    const position = await this.gamePlayerRepository.getNextPlayerPosition(gameId)

    // Crear el nuevo jugador
    const gamePlayer = await this.gamePlayerRepository.create({
      userId,
      gameId,
      position,
      isReady: false,
      cardsCount: 0
    })

    return gamePlayer
  }

  async leaveGame(userId, gameId) {
    const player = await this.gamePlayerRepository.findByGameAndUser(gameId, userId)
    if (!player) {
      throw new ApiError('Player not found in game', 404)
    }

    const gameRepository = AppDataSource.getRepository(UnoGame)
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new ApiError('Game not found', 404)
    }

    if (game.status !== 'waiting') {
      throw new ApiError('Cannot leave a game that has already started', 400)
    }

    await this.gamePlayerRepository.delete(player.id)
    return true
  }

  async setReady(userId, gameId, isReady) {
    const player = await this.gamePlayerRepository.findByGameAndUser(gameId, userId)
    if (!player) {
      throw new ApiError('Player not found in game', 404)
    }

    const gameRepository = AppDataSource.getRepository(UnoGame)
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new ApiError('Game not found', 404)
    }

    if (game.status !== 'waiting') {
      throw new ApiError('Cannot change ready status after game has started', 400)
    }

    await this.gamePlayerRepository.update(player.id, { isReady })
    return await this.gamePlayerRepository.findById(player.id)
  }

  async getGamePlayers(gameId) {
    const players = await this.gamePlayerRepository.findByGame(gameId)
    if (!players || players.length === 0) {
      throw new ApiError('No players found for this game', 404)
    }
    return players
  }
}

module.exports = new GamePlayerService()
