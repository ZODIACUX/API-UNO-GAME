const { AppDataSource } = require('../database/data-source')
const { Card } = require('../entities/Card')
const { IsNull } = require('typeorm')

class CardRepository {
  constructor() {
    this.repository = null
  }

  async getRepository() {
    if (!this.repository) {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }
      this.repository = AppDataSource.getRepository(Card)
    }
    return this.repository
  }

  async findById(id) {
    const repository = await this.getRepository()
    return await repository.findOne({
      where: { id }
    })
  }

  async findByType(type) {
    const repository = await this.getRepository()
    return await repository.find({
      where: { type }
    })
  }

  async findByColor(color) {
    const repository = await this.getRepository()
    return await repository.find({
      where: { color }
    })
  }

  async findByValue(value) {
    const repository = await this.getRepository()
    return await repository.find({
      where: { value: value === null ? IsNull() : value }
    })
  }

  async findAll() {
    const repository = await this.getRepository()
    return await repository.find()
  }

  async create(cardData) {
    const repository = await this.getRepository()
    const card = repository.create(cardData)
    return await repository.save(card)
  }

  async createMany(cardsData) {
    const repository = await this.getRepository()
    if (!cardsData || cardsData.length === 0) {
      return []
    }
    const cards = repository.create(cardsData)
    return await repository.save(cards)
  }
}

module.exports = new CardRepository()
