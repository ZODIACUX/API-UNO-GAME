/**
 * Interface Segregation Principle (ISP) - Write-only repository operations
 * Clients that only need write operations don't depend on read methods
 */
class IWriteRepository {
  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Result>} Result containing created entity or error
   */
  async create(_data) {
    throw new Error('Method create must be implemented')
  }

  /**
   * Update an existing entity
   * @param {number|string} id - Entity ID
   * @param {Object} data - Updated entity data
   * @returns {Promise<Result>} Result containing updated entity or error
   */
  async update(_id, _data) {
    throw new Error('Method update must be implemented')
  }

  /**
   * Delete an entity by ID
   * @param {number|string} id - Entity ID
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async delete(_id) {
    throw new Error('Method delete must be implemented')
  }

  /**
   * Create multiple entities
   * @param {Array} dataArray - Array of entity data
   * @returns {Promise<Result>} Result containing created entities or error
   */
  async bulkCreate(_dataArray) {
    throw new Error('Method bulkCreate must be implemented')
  }

  /**
   * Update multiple entities
   * @param {Object} criteria - Update criteria
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing update result or error
   */
  async bulkUpdate(_criteria, _data) {
    throw new Error('Method bulkUpdate must be implemented')
  }

  /**
   * Delete multiple entities
   * @param {Object} criteria - Deletion criteria
   * @returns {Promise<Result>} Result containing deletion result or error
   */
  async bulkDelete(_criteria) {
    throw new Error('Method bulkDelete must be implemented')
  }
}

module.exports = IWriteRepository
