const { AppDataSource } = require('../database/data-source')
const { UnoGame } = require('../entities/UnoGame')
const { GamePlayer } = require('../entities/GamePlayer')
const { User } = require('../entities/User')

class GameRepository {
  async findById(id) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    return await gameRepository.findOne({ where: { id } })
  }

  async findByIdWithPlayers(id) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    return await gameRepository.findOne({
      where: { id },
      relations: ['players', 'players.user']
    })
  }

  async create(gameData) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    const game = gameRepository.create(gameData)
    return await gameRepository.save(game)
  }

  async update(id, gameData) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    const result = await gameRepository.update(id, gameData)
    return result.affected > 0
  }

  async delete(id) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    const result = await gameRepository.delete(id)
    return result.affected > 0
  }

  async findGamesByCreator(creatorId) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    return await gameRepository.find({ where: { creatorId } })
  }

  async findGamesByStatus(status) {
    const gameRepository = AppDataSource.getRepository(UnoGame)
    return await gameRepository.find({ where: { status } })
  }

  async getPlayerCount(gameId) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    return await playerRepository.count({ where: { gameId } })
  }

  async getGamePlayers(gameId) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    return await playerRepository.find({
      where: { gameId },
      relations: ['user'],
      order: { position: 'ASC' }
    })
  }

  async addPlayerToGame(userId, gameId, position) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    const player = playerRepository.create({
      userId,
      gameId,
      position
    })
    return await playerRepository.save(player)
  }

  async removePlayerFromGame(userId, gameId) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    const result = await playerRepository.delete({ userId, gameId })
    return result.affected > 0
  }

  async findPlayerInGame(userId, gameId) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    return await playerRepository.findOne({
      where: { userId, gameId }
    })
  }

  async updatePlayerReady(userId, gameId, isReady) {
    const playerRepository = AppDataSource.getRepository(GamePlayer)
    const result = await playerRepository.update(
      { userId, gameId },
      { isReady }
    )
    return result.affected > 0
  }
}

module.exports = new GameRepository()
