/**
 * Interface for User-specific repository operations
 * Follows Interface Segregation Principle - only user-related methods
 */
class IUserRepository {
  async findByUsername(_username) {
    throw new Error('Method findByUsername must be implemented')
  }

  async findByUsernameWithPassword(_username) {
    throw new Error('Method findByUsernameWithPassword must be implemented')
  }

  async findByEmail(_email) {
    throw new Error('Method findByEmail must be implemented')
  }

  async findByUsernameOrEmail(_username, _email) {
    throw new Error('Method findByUsernameOrEmail must be implemented')
  }

  async findActiveUsers() {
    throw new Error('Method findActiveUsers must be implemented')
  }
}

module.exports = IUserRepository
