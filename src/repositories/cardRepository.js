const BaseRepository = require('../core/repositories/BaseRepository')
const { AppDataSource } = require('../database/data-source')
const { Card } = require('../entities/Card')
const { IsNull } = require('typeorm')
const Result = require('../core/errors/Result')

class CardRepository extends BaseRepository {
  constructor() {
    super(Card, AppDataSource)
  }

  async findByType(type) {
    return Result.fromAsync(async () => {
      if (!type) {
        throw new Error('Type parameter is required')
      }

      const repository = await this.getRepository()
      return await repository.find({
        where: { type }
      })
    })
  }

  async findByColor(color) {
    return Result.fromAsync(async () => {
      if (!color) {
        throw new Error('Color parameter is required')
      }

      const repository = await this.getRepository()
      return await repository.find({
        where: { color }
      })
    })
  }

  async findByValue(value) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.find({
        where: { value: value === null ? IsNull() : value }
      })
    })
  }

  async createMany(cardsData) {
    return Result.fromAsync(async () => {
      if (!Array.isArray(cardsData) || cardsData.length === 0) {
        throw new Error('Cards data must be a non-empty array')
      }

      const repository = await this.getRepository()
      const cards = repository.create(cardsData)
      return await repository.save(cards)
    })
  }

  async findCardsByTypeAndColor(type, color) {
    return Result.fromAsync(async () => {
      if (!type || !color) {
        throw new Error('Both type and color parameters are required')
      }

      const repository = await this.getRepository()
      return await repository.find({
        where: { type, color }
      })
    })
  }
}

module.exports = new CardRepository()
