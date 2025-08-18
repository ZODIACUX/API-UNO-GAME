const { IReadRepository } = require('../interfaces')
const Result = require('../errors/Result')

class ReadOnlyRepository extends IReadRepository {
  constructor(entity, dataSource) {
    super()
    this.entity = entity
    this.dataSource = dataSource
    this.repository = null
  }

  async getRepository() {
    if (!this.repository) {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize()
      }
      this.repository = this.dataSource.getRepository(this.entity)
    }
    return this.repository
  }

  async findById(id) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      const entity = await repository.findOne({ where: { id } })
      if (!entity) {
        throw new Error(`Entity with id ${id} not found`)
      }
      return entity
    })
  }

  async findAll(options = {}) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.find(options)
    })
  }

  async findBy(criteria) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.find({ where: criteria })
    })
  }

  async exists(id) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      const count = await repository.count({ where: { id } })
      return count > 0
    })
  }

  async count(options = {}) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.count(options)
    })
  }
}

module.exports = ReadOnlyRepository
