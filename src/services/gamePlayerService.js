const { AppDataSource } = require('../config/data-source')
const { GamePlayer } = require('../models/GamePlayer')
const { UnoGame } = require('../models/UnoGame')
const { User } = require('../models/User')

class GamePlayerService {
  constructor() {
    this.gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
    this.gameRepository = AppDataSource.getRepository(UnoGame)
    this.userRepository = AppDataSource.getRepository(User)
  }

  async joinGame(userId, gameId) {
    const game = await this.gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not in waiting status')
    }

    // Verificar si el jugador ya está en el juego
    const existingPlayer = await this.gamePlayerRepository.findOne({
      where: { gameId, userId }
    })
    if (existingPlayer) {
      throw new Error('Player is already in the game')
    }

    // Obtener la siguiente posición disponible
    const maxPositionResult = await this.gamePlayerRepository
      .createQueryBuilder('gamePlayer')
      .select('MAX(gamePlayer.position)', 'maxPosition')
      .where('gamePlayer.gameId = :gameId', { gameId })
      .getRawOne()

    const position = (parseInt(maxPositionResult.maxPosition || 0) + 1)

    // Crear el nuevo jugador
    const gamePlayer = this.gamePlayerRepository.create({
      userId,
      gameId,
      position,
      isReady: false,
      cardsCount: 0
    })

    return await this.gamePlayerRepository.save(gamePlayer)
  }

  async leaveGame(userId, gameId) {
    const player = await this.gamePlayerRepository.findOne({
      where: { gameId, userId }
    })
    if (!player) {
      throw new Error('Player not found in game')
    }

    const game = await this.gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'waiting') {
      throw new Error('Cannot leave a game that has already started')
    }

    await this.gamePlayerRepository.delete(player.id)
    return true
  }

  async setReady(userId, gameId, isReady) {
    const player = await this.gamePlayerRepository.findOne({
      where: { gameId, userId }
    })
    if (!player) {
      throw new Error('Player not found in game')
    }

    const game = await this.gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'waiting') {
      throw new Error('Cannot change ready status after game has started')
    }

    await this.gamePlayerRepository.update(player.id, { isReady })
    return await this.gamePlayerRepository.findOne({
      where: { id: player.id },
      relations: ['user', 'game']
    })
  }

  async getGamePlayers(gameId) {
    const players = await this.gamePlayerRepository.find({
      where: { gameId },
      relations: ['user', 'game', 'cards'],
      order: { position: 'ASC' }
    })
    if (!players || players.length === 0) {
      throw new Error('No players found for this game')
    }
    return players
  }

  async getCardsCount(playerId) {
    const result = await this.gamePlayerRepository
      .createQueryBuilder('gamePlayer')
      .leftJoin('gamePlayer.cards', 'cards')
      .select('COUNT(cards.id)', 'count')
      .where('gamePlayer.id = :playerId', { playerId })
      .getRawOne()
    return parseInt(result.count || 0)
  }

  async updateCardsCount(playerId) {
    const count = await this.getCardsCount(playerId)
    await this.gamePlayerRepository.update(playerId, { cardsCount: count })
    return count
  }
}

module.exports = new GamePlayerService()
