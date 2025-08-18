const BaseRepository = require('./BaseRepository')
const Result = require('../errors/Result')

class CachedRepository extends BaseRepository {
  constructor(entity, dataSource, cacheService) {
    super(entity, dataSource)
    this.cacheService = cacheService
    this.cacheTimeout = 300000 // 5 minutes
  }

  async findById(id) {
    return Result.fromAsync(async () => {
      const cacheKey = `${this.entity.name}_${id}`

      const cachedResult = await this.cacheService.get(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      const result = await super.findById(id)
      if (result.isSuccess) {
        await this.cacheService.set(cacheKey, result.value, this.cacheTimeout)
      }

      return result.value
    })
  }

  async create(data) {
    return Result.fromAsync(async () => {
      const result = await super.create(data)

      if (result.isSuccess) {
        const cacheKey = `${this.entity.name}_${result.value.id}`
        await this.cacheService.set(cacheKey, result.value, this.cacheTimeout)
        await this.cacheService.invalidatePattern(`${this.entity.name}_list_*`)
      }

      return result.value
    })
  }

  async update(id, data) {
    return Result.fromAsync(async () => {
      const result = await super.update(id, data)

      if (result.isSuccess) {
        const cacheKey = `${this.entity.name}_${id}`
        await this.cacheService.delete(cacheKey)
        await this.cacheService.invalidatePattern(`${this.entity.name}_list_*`)
      }

      return result.value
    })
  }

  async delete(id) {
    return Result.fromAsync(async () => {
      const result = await super.delete(id)

      if (result.isSuccess) {
        const cacheKey = `${this.entity.name}_${id}`
        await this.cacheService.delete(cacheKey)
        await this.cacheService.invalidatePattern(`${this.entity.name}_list_*`)
      }

      return result.value
    })
  }

  async findAll(options = {}) {
    return Result.fromAsync(async () => {
      const cacheKey = `${this.entity.name}_list_${JSON.stringify(options)}`

      const cachedResult = await this.cacheService.get(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      const result = await super.findAll(options)
      if (result.isSuccess) {
        await this.cacheService.set(cacheKey, result.value, this.cacheTimeout)
      }

      return result.value
    })
  }
}

module.exports = CachedRepository
