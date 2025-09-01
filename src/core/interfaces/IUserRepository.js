/**
 * Interface Segregation Principle (ISP) - User-specific repository operations
 * Focused interface for user-related database operations
 */
class IUserRepository {
  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByUsername(_username) {
    throw new Error('Method findByUsername must be implemented')
  }

  /**
   * Find user by email
   * @param {string} email - Email to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByEmail(_email) {
    throw new Error('Method findByEmail must be implemented')
  }

  /**
   * Find user by username or email
   * @param {string} username - Username to search for
   * @param {string} email - Email to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByUsernameOrEmail(_username, _email) {
    throw new Error('Method findByUsernameOrEmail must be implemented')
  }

  /**
   * Find user by username with password (for authentication)
   * @param {string} username - Username to search for
   * @returns {Promise<Result>} Result containing user with password or error
   */
  async findByUsernameWithPassword(_username) {
    throw new Error('Method findByUsernameWithPassword must be implemented')
  }

  /**
   * Find all active users
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing active users or error
   */
  async findActiveUsers(_options = {}) {
    throw new Error('Method findActiveUsers must be implemented')
  }

  /**
   * Update user's last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateLastLogin(_userId) {
    throw new Error('Method updateLastLogin must be implemented')
  }

  /**
   * Deactivate user account
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async deactivateUser(_userId) {
    throw new Error('Method deactivateUser must be implemented')
  }
}

module.exports = IUserRepository
