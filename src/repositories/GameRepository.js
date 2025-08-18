const BaseRepository = require('../core/repositories/BaseRepository')
const { AppDataSource } = require('../database/data-source')
const { UnoGame } = require('../entities/UnoGame')
const { GamePlayer } = require('../entities/GamePlayer')
const Result = require('../core/errors/Result')

class GameRepository extends BaseRepository {
  constructor() {
    super(UnoGame, AppDataSource)
  }

  async findByIdWithPlayers(id) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('Game ID is required')
      }

      const repository = await this.getRepository()
      const game = await repository.findOne({
        where: { id },
        relations: ['players', 'players.user']
      })

      if (!game) {
        throw new Error('Game not found')
      }

      return game
    })
  }

  async findGamesByCreator(creatorId) {
    return Result.fromAsync(async () => {
      if (!creatorId) {
        throw new Error('Creator ID is required')
      }

      const repository = await this.getRepository()
      return await repository.find({
        where: { creatorId }
      })
    })
  }

  async findGamesByStatus(status) {
    return Result.fromAsync(async () => {
      if (!status) {
        throw new Error('Status is required')
      }

      const repository = await this.getRepository()
      return await repository.find({
        where: { status }
      })
    })
  }

  async getPlayerCount(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      return await gamePlayerRepository.count({
        where: { gameId }
      })
    })
  }

  async getGamePlayers(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      return await gamePlayerRepository.find({
        where: { gameId },
        relations: ['user'],
        order: { position: 'ASC' }
      })
    })
  }

  async addPlayerToGame(userId, gameId, position) {
    return Result.fromAsync(async () => {
      if (!userId || !gameId || position === undefined) {
        throw new Error('User ID, Game ID, and position are required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      const gamePlayer = gamePlayerRepository.create({
        userId,
        gameId,
        position
      })
      return await gamePlayerRepository.save(gamePlayer)
    })
  }

  async removePlayerFromGame(userId, gameId) {
    return Result.fromAsync(async () => {
      if (!userId || !gameId) {
        throw new Error('User ID and Game ID are required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      const result = await gamePlayerRepository.delete({
        userId,
        gameId
      })
      return result.affected > 0
    })
  }

  async findPlayerInGame(userId, gameId) {
    return Result.fromAsync(async () => {
      if (!userId || !gameId) {
        throw new Error('User ID and Game ID are required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      return await gamePlayerRepository.findOne({
        where: { userId, gameId },
        relations: ['user']
      })
    })
  }

  async updatePlayerReady(userId, gameId, isReady) {
    return Result.fromAsync(async () => {
      if (!userId || !gameId || typeof isReady !== 'boolean') {
        throw new Error('User ID, Game ID, and isReady boolean are required')
      }

      const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
      const result = await gamePlayerRepository.update(
        { userId, gameId },
        { isReady }
      )
      return result.affected > 0
    })
  }
}

module.exports = new GameRepository()
