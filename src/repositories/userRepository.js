const BaseRepository = require('../core/repositories/BaseRepository')
const { User } = require('../models/User')
const Result = require('../core/errors/Result')

/**
 * User Repository - Implements DIP and LSP
 * Dependency Inversion: Depends on IUserRepository interface
 * Liskov Substitution: Can substitute BaseRepository anywhere it's expected
 */
class UserRepository extends BaseRepository {
  constructor(dataSource) {
    super(dataSource, User)
  }

  /**
   * Find user by username - IUserRepository implementation
   * @param {string} username - Username to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByUsername(username) {
    return Result.fromAsync(async () => {
      if (!username) {
        throw new Error('Username is required')
      }

      const user = await this.getRepository().findOne({
        where: { username, isActive: true }
      })

      if (!user) {
        throw new Error(`User with username '${username}' not found`)
      }

      return user
    })
  }

  /**
   * Find user by email - IUserRepository implementation
   * @param {string} email - Email to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByEmail(email) {
    return Result.fromAsync(async () => {
      if (!email) {
        throw new Error('Email is required')
      }

      const user = await this.getRepository().findOne({
        where: { email, isActive: true }
      })

      if (!user) {
        throw new Error(`User with email '${email}' not found`)
      }

      return user
    })
  }

  /**
   * Find user by username or email - IUserRepository implementation
   * @param {string} username - Username to search for
   * @param {string} email - Email to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByUsernameOrEmail(username, email) {
    return Result.fromAsync(async () => {
      if (!username && !email) {
        throw new Error('Username or email is required')
      }

      const user = await this.getRepository().findOne({
        where: [
          { username, isActive: true },
          { email, isActive: true }
        ]
      })

      return user // Return null if not found, don't throw error
    })
  }

  /**
   * Find user by username with password - IUserRepository implementation
   * @param {string} username - Username to search for
   * @returns {Promise<Result>} Result containing user with password or error
   */
  async findByUsernameWithPassword(username) {
    return Result.fromAsync(async () => {
      if (!username) {
        throw new Error('Username is required')
      }

      const user = await this.getRepository().findOne({
        where: { username, isActive: true },
        select: ['id', 'username', 'email', 'password', 'isActive', 'createdAt', 'updatedAt']
      })

      if (!user) {
        throw new Error(`User with username '${username}' not found`)
      }

      return user
    })
  }

  /**
   * Find all active users - IUserRepository implementation
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing active users or error
   */
  async findActiveUsers(options = {}) {
    return Result.fromAsync(async () => {
      const { limit, offset, order } = options
      const queryOptions = {
        where: { isActive: true }
      }

      if (limit) queryOptions.take = limit
      if (offset) queryOptions.skip = offset
      if (order) queryOptions.order = order

      const users = await this.getRepository().find(queryOptions)
      return users
    })
  }

  /**
   * Update user's last login timestamp - IUserRepository implementation
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateLastLogin(userId) {
    return Result.fromAsync(async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const result = await this.getRepository().update(userId, {
        lastLogin: new Date()
      })

      return result
    })
  }

  /**
   * Deactivate user account - IUserRepository implementation
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async deactivateUser(userId) {
    return Result.fromAsync(async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const result = await this.getRepository().update(userId, {
        isActive: false
      })

      return result
    })
  }

  /**
   * Override create to ensure password is hashed - LSP compliance
   * @param {Object} data - User data
   * @returns {Promise<Result>} Result containing created user or error
   */
  async create(data) {
    return Result.fromAsync(async () => {
      if (!data) {
        throw new Error('User data is required')
      }

      // Ensure isActive is set to true by default
      const userData = {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true
      }

      const entity = this.getRepository().create(userData)
      const savedEntity = await this.getRepository().save(entity)

      return savedEntity
    })
  }

  /**
   * Override update to handle sensitive fields - LSP compliance
   * @param {number|string} id - User ID
   * @param {Object} data - Updated data
   * @returns {Promise<Result>} Result containing updated user or error
   */
  async update(id, data) {
    return Result.fromAsync(async () => {
      if (!id) {
        throw new Error('User ID is required')
      }
      if (!data) {
        throw new Error('Update data is required')
      }

      // Remove sensitive fields that shouldn't be updated directly
      const { id: _id, createdAt: _createdAt, ...safeData } = data

      await this.getRepository().update(id, safeData)
      const entity = await this.getRepository().findOne({ where: { id } })

      if (!entity) {
        throw new Error(`User with id ${id} not found after update`)
      }

      return entity
    })
  }
}

module.exports = UserRepository
