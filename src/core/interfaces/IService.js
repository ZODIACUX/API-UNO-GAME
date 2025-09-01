/**
 * Interface Segregation Principle (ISP) - Base service interface
 * Common service operations that all services should implement
 */
class IService {
  /**
   * Get entity by ID
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing entity or error
   */
  async getById(_id) {
    throw new Error('Method getById must be implemented')
  }

  /**
   * Get all entities
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing entities or error
   */
  async getAll(_options = {}) {
    throw new Error('Method getAll must be implemented')
  }

  /**
   * Create new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Result>} Result containing created entity or error
   */
  async create(_data) {
    throw new Error('Method create must be implemented')
  }

  /**
   * Update existing entity
   * @param {number|string} id - Entity ID
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing updated entity or error
   */
  async update(_id, _data) {
    throw new Error('Method update must be implemented')
  }

  /**
   * Delete entity
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async delete(_id) {
    throw new Error('Method delete must be implemented')
  }
}

module.exports = IService
