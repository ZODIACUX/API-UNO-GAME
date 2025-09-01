/**
 * Interface Segregation Principle (ISP) - Read-only repository operations
 * Clients that only need read operations don't depend on write methods
 */
class IReadRepository {
  /**
   * Find entity by ID
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing entity or error
   */
  async findById(_id) {
    throw new Error('Method findById must be implemented')
  }

  /**
   * Find all entities
   * @param {Object} options - Query options (limit, offset, etc.)
   * @returns {Promise<Result>} Result containing array of entities or error
   */
  async findAll(_options = {}) {
    throw new Error('Method findAll must be implemented')
  }

  /**
   * Find entities by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing array of entities or error
   */
  async findBy(_criteria, _options = {}) {
    throw new Error('Method findBy must be implemented')
  }

  /**
   * Check if entity exists by ID
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing boolean or error
   */
  async exists(_id) {
    throw new Error('Method exists must be implemented')
  }

  /**
   * Count entities matching criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Result>} Result containing count or error
   */
  async count(_criteria = {}) {
    throw new Error('Method count must be implemented')
  }

  /**
   * Find one entity by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Result>} Result containing entity or error
   */
  async findOne(_criteria) {
    throw new Error('Method findOne must be implemented')
  }
}

module.exports = IReadRepository
