const Result = require('../errors/Result')
const IService = require('../interfaces/IService')

/**
 * Base Service - Implements SRP and LSP
 * Single Responsibility: Common service operations
 * Liskov Substitution: All derived services can substitute this base class
 */
class BaseService extends IService {
  constructor(repository) {
    super()
    this.repository = repository
  }

  /**
   * Get entity by ID - LSP compliant implementation
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing entity or error
   */
  async getById(id) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('ID is required')
      }

      const result = await this.repository.findById(id)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Get all entities - LSP compliant implementation
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing entities or error
   */
  async getAll(options = {}) {
    return Result.fromAsync(async () => {
      const result = await this.repository.findAll(options)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Create new entity - LSP compliant implementation
   * @param {Object} data - Entity data
   * @returns {Promise<Result>} Result containing created entity or error
   */
  async create(data) {
    return Result.fromAsync(async () => {
      if (!data) {
        throw new Error('Data is required')
      }

      // Validate data before creation
      const validationResult = await this.validateForCreate(data)
      if (!validationResult.isSuccess) {
        throw validationResult.error
      }

      const result = await this.repository.create(data)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Update existing entity - LSP compliant implementation
   * @param {number|string} id - Entity ID
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing updated entity or error
   */
  async update(id, data) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('ID is required')
      }
      if (!data) {
        throw new Error('Data is required')
      }

      // Check if entity exists
      const existsResult = await this.repository.exists(id)
      if (!existsResult.isSuccess) {
        throw existsResult.error
      }
      if (!existsResult.value) {
        throw new Error(`Entity with id ${id} not found`)
      }

      // Validate data before update
      const validationResult = await this.validateForUpdate(id, data)
      if (!validationResult.isSuccess) {
        throw validationResult.error
      }

      const result = await this.repository.update(id, data)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Delete entity - LSP compliant implementation
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async delete(id) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('ID is required')
      }

      // Check if entity exists
      const existsResult = await this.repository.exists(id)
      if (!existsResult.isSuccess) {
        throw existsResult.error
      }
      if (!existsResult.value) {
        throw new Error(`Entity with id ${id} not found`)
      }

      // Validate deletion
      const validationResult = await this.validateForDelete(id)
      if (!validationResult.isSuccess) {
        throw validationResult.error
      }

      const result = await this.repository.delete(id)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Find entities by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing entities or error
   */
  async findBy(criteria, options = {}) {
    return Result.fromAsync(async () => {
      const result = await this.repository.findBy(criteria, options)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Count entities matching criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Result>} Result containing count or error
   */
  async count(criteria = {}) {
    return Result.fromAsync(async () => {
      const result = await this.repository.count(criteria)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Check if entity exists
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing boolean or error
   */
  async exists(id) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('ID is required')
      }

      const result = await this.repository.exists(id)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Validate data for creation - Override in derived classes
   * @param {Object} data - Data to validate
   * @returns {Promise<Result>} Validation result
   */
  async validateForCreate(_data) {
    return Result.success(true)
  }

  /**
   * Validate data for update - Override in derived classes
   * @param {number|string} id - Entity ID
   * @param {Object} data - Data to validate
   * @returns {Promise<Result>} Validation result
   */
  async validateForUpdate(_id, _data) {
    return Result.success(true)
  }

  /**
   * Validate deletion - Override in derived classes
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Validation result
   */
  async validateForDelete(_id) {
    return Result.success(true)
  }
}

module.exports = BaseService
