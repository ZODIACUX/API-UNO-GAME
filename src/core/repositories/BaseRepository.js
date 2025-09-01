const Result = require('../errors/Result')
const IReadRepository = require('../interfaces/IReadRepository')

/**
 * Base Repository - Implements LSP (Liskov Substitution Principle)
 * All derived repositories can substitute this base class
 * Provides common CRUD operations with consistent Result monad interface
 */
class BaseRepository extends IReadRepository {
  constructor(dataSource, entityClass) {
    super()
    this.dataSource = dataSource
    this.entityClass = entityClass
    this.repository = null
  }

  /**
   * Initialize repository - must be called after DataSource is initialized
   */
  initialize() {
    if (this.dataSource && this.dataSource.isInitialized) {
      this.repository = this.dataSource.getRepository(this.entityClass)
    }
  }

  /**
   * Get TypeORM repository instance
   * @returns {Repository} TypeORM repository
   */
  getRepository() {
    if (!this.repository) {
      this.initialize()
    }
    if (!this.repository) {
      throw new Error('Repository not initialized. DataSource may not be ready.')
    }
    return this.repository
  }

  /**
   * Find entity by ID - LSP compliant implementation
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing entity or error
   */
  async findById(id) {
    return Result.fromAsync(async () => {
      const entity = await this.getRepository().findOne({ where: { id } })
      if (!entity) {
        throw new Error(`Entity with id ${id} not found`)
      }
      return entity
    })
  }

  /**
   * Find all entities - LSP compliant implementation
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing entities or error
   */
  async findAll(options = {}) {
    return Result.fromAsync(async () => {
      const { limit, offset, order } = options
      const queryOptions = {}

      if (limit) queryOptions.take = limit
      if (offset) queryOptions.skip = offset
      if (order) queryOptions.order = order

      return await this.getRepository().find(queryOptions)
    })
  }

  /**
   * Find entities by criteria - LSP compliant implementation
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing entities or error
   */
  async findBy(criteria, options = {}) {
    return Result.fromAsync(async () => {
      const { limit, offset, order } = options
      const queryOptions = { where: criteria }

      if (limit) queryOptions.take = limit
      if (offset) queryOptions.skip = offset
      if (order) queryOptions.order = order

      return await this.getRepository().find(queryOptions)
    })
  }

  /**
   * Find one entity by criteria - LSP compliant implementation
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Result>} Result containing entity or error
   */
  async findOne(criteria) {
    return Result.fromAsync(async () => {
      const entity = await this.getRepository().findOne({ where: criteria })
      if (!entity) {
        throw new Error('Entity not found')
      }
      return entity
    })
  }

  /**
   * Check if entity exists - LSP compliant implementation
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing boolean or error
   */
  async exists(id) {
    return Result.fromAsync(async () => {
      const count = await this.getRepository().count({ where: { id } })
      return count > 0
    })
  }

  /**
   * Count entities - LSP compliant implementation
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Result>} Result containing count or error
   */
  async count(criteria = {}) {
    return Result.fromAsync(async () => {
      return await this.getRepository().count({ where: criteria })
    })
  }

  /**
   * Create entity - Write operation
   * @param {Object} data - Entity data
   * @returns {Promise<Result>} Result containing created entity or error
   */
  async create(data) {
    return Result.fromAsync(async () => {
      const entity = this.getRepository().create(data)
      return await this.getRepository().save(entity)
    })
  }

  /**
   * Update entity - Write operation
   * @param {number|string} id - Entity ID
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing updated entity or error
   */
  async update(id, data) {
    return Result.fromAsync(async () => {
      await this.getRepository().update(id, data)
      const entity = await this.getRepository().findOne({ where: { id } })
      if (!entity) {
        throw new Error(`Entity with id ${id} not found after update`)
      }
      return entity
    })
  }

  /**
   * Delete entity - Write operation
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async delete(id) {
    return Result.fromAsync(async () => {
      const result = await this.getRepository().delete(id)
      return { affected: result.affected, id }
    })
  }

  /**
   * Bulk create entities
   * @param {Array} dataArray - Array of entity data
   * @returns {Promise<Result>} Result containing created entities or error
   */
  async bulkCreate(dataArray) {
    return Result.fromAsync(async () => {
      const entities = this.getRepository().create(dataArray)
      return await this.getRepository().save(entities)
    })
  }
}

module.exports = BaseRepository
