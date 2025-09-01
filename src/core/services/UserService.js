const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * User Service - Single Responsibility Principle (SRP)
 * Single Responsibility: Handle user management operations only
 * Extends BaseService for LSP compliance
 */
class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository)
    this.userRepository = userRepository
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Result>} Result containing created user or error
   */
  async register(userData) {
    return Result.fromAsync(async () => {
      const { username, email, password } = userData

      if (!username || !email || !password) {
        throw new Error('Username, email, and password are required')
      }

      // Check if user already exists
      const existingUserResult = await this.userRepository.findByUsernameOrEmail(username, email)
      if (existingUserResult.isSuccess) {
        throw new Error('User already exists with this username or email')
      }

      // Hash password before storing
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user data
      const userToCreate = {
        username,
        email,
        password: hashedPassword,
        isActive: true
      }

      const result = await this.userRepository.create(userToCreate)
      if (!result.isSuccess) {
        throw result.error
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = result.value
      return userWithoutPassword
    })
  }

  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByUsername(username) {
    return Result.fromAsync(async () => {
      if (!username) {
        throw new Error('Username is required')
      }

      const result = await this.userRepository.findByUsername(username)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Find user by email
   * @param {string} email - Email to search for
   * @returns {Promise<Result>} Result containing user or error
   */
  async findByEmail(email) {
    return Result.fromAsync(async () => {
      if (!email) {
        throw new Error('Email is required')
      }

      const result = await this.userRepository.findByEmail(email)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Get all active users
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing active users or error
   */
  async getActiveUsers(options = {}) {
    return Result.fromAsync(async () => {
      const result = await this.userRepository.findActiveUsers(options)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Result>} Result containing updated user or error
   */
  async updateProfile(userId, profileData) {
    return Result.fromAsync(async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      // Remove sensitive fields that shouldn't be updated via profile
      const { password: _password, isActive: _isActive, ...safeProfileData } = profileData

      const result = await this.userRepository.update(userId, safeProfileData)
      if (!result.isSuccess) {
        throw result.error
      }

      return result.value
    })
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Result>} Result containing success status or error
   */
  async changePassword(userId, currentPassword, newPassword) {
    return Result.fromAsync(async () => {
      if (!userId || !currentPassword || !newPassword) {
        throw new Error('User ID, current password, and new password are required')
      }

      // Get user with password
      const userResult = await this.userRepository.findById(userId)
      if (!userResult.isSuccess) {
        throw new Error('User not found')
      }

      const user = userResult.value

      // Verify current password
      const bcrypt = require('bcryptjs')
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      const updateResult = await this.userRepository.update(userId, {
        password: hashedNewPassword
      })

      if (!updateResult.isSuccess) {
        throw updateResult.error
      }

      return { success: true, message: 'Password changed successfully' }
    })
  }

  /**
   * Deactivate user account
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing deactivation status or error
   */
  async deactivateUser(userId) {
    return Result.fromAsync(async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const result = await this.userRepository.deactivateUser(userId)
      if (!result.isSuccess) {
        throw result.error
      }

      return { success: true, message: 'User deactivated successfully' }
    })
  }

  /**
   * Validate user data for creation - Override from BaseService
   * @param {Object} data - User data to validate
   * @returns {Promise<Result>} Validation result
   */
  async validateForCreate(data) {
    return Result.fromAsync(async () => {
      const { username, email, password } = data

      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email is required')
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      return true
    })
  }

  /**
   * Validate user data for update - Override from BaseService
   * @param {number} id - User ID
   * @param {Object} data - User data to validate
   * @returns {Promise<Result>} Validation result
   */
  async validateForUpdate(id, data) {
    return Result.fromAsync(async () => {
      if (data.username && data.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Valid email is required')
      }

      return true
    })
  }

  /**
   * Validate user deletion - Override from BaseService
   * @param {number} id - User ID
   * @returns {Promise<Result>} Validation result
   */
  async validateForDelete(_id) {
    return Result.fromAsync(async () => {
      // Check if user has active games or other dependencies
      // This is where you'd add business logic to prevent deletion
      // if the user has active relationships

      return true
    })
  }
}

module.exports = UserService
