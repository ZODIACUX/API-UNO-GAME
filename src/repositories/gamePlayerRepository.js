const { AppDataSource } = require('../database/data-source')
const { GamePlayer } = require('../entities/GamePlayer')

class GamePlayerRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(GamePlayer)
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'game']
    })
  }

  async findByGameAndUser(gameId, userId) {
    return await this.repository.findOne({
      where: { gameId, userId },
      relations: ['user', 'game', 'cards']
    })
  }

  async findByGame(gameId) {
    return await this.repository.find({
      where: { gameId },
      relations: ['user', 'game', 'cards'],
      order: { position: 'ASC' }
    })
  }

  async create(gamePlayerData) {
    const gamePlayer = this.repository.create(gamePlayerData)
    return await this.repository.save(gamePlayer)
  }

  async update(id, gamePlayerData) {
    await this.repository.update(id, gamePlayerData)
    return await this.findById(id)
  }

  async delete(id) {
    const result = await this.repository.delete(id)
    return result.affected > 0
  }

  async getCardsCount(id) {
    const result = await this.repository
      .createQueryBuilder('gamePlayer')
      .leftJoin('gamePlayer.cards', 'cards')
      .select('COUNT(cards.id)', 'count')
      .where('gamePlayer.id = :id', { id })
      .getRawOne()
    return parseInt(result.count || 0)
  }

  async updateCardsCount(id) {
    const count = await this.getCardsCount(id)
    await this.repository.update(id, { cardsCount: count })
    return count
  }

  async getNextPlayerPosition(gameId) {
    const result = await this.repository
      .createQueryBuilder('gamePlayer')
      .select('MAX(gamePlayer.position)', 'maxPosition')
      .where('gamePlayer.gameId = :gameId', { gameId })
      .getRawOne()
    return (parseInt(result.maxPosition || 0) + 1)
  }
}

module.exports = new GamePlayerRepository()
