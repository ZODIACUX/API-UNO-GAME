const { AppDataSource } = require('../database/data-source')
const { UnoGame } = require('../entities/UnoGame')

class UnoGameRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(UnoGame)
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['players', 'players.user', 'players.cards', 'cards', 'cards.card']
    })
  }

  async findAll() {
    return await this.repository.find({
      relations: ['players', 'players.user']
    })
  }

  async findByStatus(status) {
    return await this.repository.find({
      where: { status },
      relations: ['players', 'players.user']
    })
  }

  async findByCreator(creatorId) {
    return await this.repository.find({
      where: { creatorId },
      relations: ['players', 'players.user']
    })
  }

  async create(gameData) {
    const game = this.repository.create(gameData)
    return await this.repository.save(game)
  }

  async update(id, gameData) {
    await this.repository.update(id, gameData)
    return await this.findById(id)
  }

  async delete(id) {
    const result = await this.repository.delete(id)
    return result.affected > 0
  }

  async findActiveGames() {
    return await this.repository.find({
      where: [
        { status: 'waiting' },
        { status: 'in_progress' }
      ],
      relations: ['players', 'players.user']
    })
  }

  async getGameWithFullDetails(id) {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'players',
        'players.user',
        'players.cards',
        'players.cards.card',
        'cards',
        'cards.card'
      ]
    })
  }

  async getTopGames(limit = 10) {
    return await this.repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'players')
      .select([
        'game.id',
        'game.name',
        'game.status',
        'game.createdAt',
        'COUNT(players.id) as playerCount'
      ])
      .groupBy('game.id')
      .orderBy('playerCount', 'DESC')
      .limit(limit)
      .getRawMany()
  }
}

module.exports = new UnoGameRepository()
