const Result = require('../errors/Result')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * User Authentication Service - Single Responsibility Principle (SRP)
 * Single Responsibility: Handle user authentication operations only
 * Separated from user management and other concerns
 */
class UserAuthenticationService {
  constructor(userRepository, jwtSecret) {
    this.userRepository = userRepository
    this.jwtSecret = jwtSecret
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<Result>} Result containing user data or error
   */
  async authenticateUser(username, password) {
    return Result.fromAsync(async () => {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Find user with password field
      const userResult = await this.userRepository.findByUsernameWithPassword(username)
      if (!userResult.isSuccess) {
        throw new Error('Invalid credentials')
      }

      const user = userResult.value
      if (!user || !user.isActive) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id)

      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })
  }

  /**
   * Generate JWT token for user
   * @param {number} userId - User ID
   * @param {string} username - Username
   * @returns {Promise<Result>} Result containing token or error
   */
  async generateToken(userId, username) {
    return Result.fromAsync(async () => {
      if (!userId || !username) {
        throw new Error('User ID and username are required')
      }

      const payload = {
        userId,
        username,
        iat: Math.floor(Date.now() / 1000)
      }

      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' })
      return token
    })
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Result>} Result containing decoded payload or error
   */
  async verifyToken(token) {
    return Result.fromAsync(async () => {
      if (!token) {
        throw new Error('Token is required')
      }

      try {
        const decoded = jwt.verify(token, this.jwtSecret)
        return decoded
      } catch (error) {
        throw new Error('Invalid or expired token')
      }
    })
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<Result>} Result containing hashed password or error
   */
  async hashPassword(password) {
    return Result.fromAsync(async () => {
      if (!password) {
        throw new Error('Password is required')
      }

      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      return hashedPassword
    })
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async comparePassword(password, hash) {
    if (!password || !hash) {
      return false
    }

    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      return false
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Result} Validation result
   */
  validatePasswordStrength(password) {
    return Result.from(() => {
      if (!password) {
        throw new Error('Password is required')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      if (!/(?=.*[a-z])/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter')
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter')
      }

      if (!/(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one number')
      }

      return {
        valid: true,
        strength: this.calculatePasswordStrength(password)
      }
    })
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password to evaluate
   * @returns {Object} Strength score and level
   */
  calculatePasswordStrength(password) {
    let score = 0
    let level = 'weak'

    // Length bonus
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-zA-Z\d]/.test(password)) score += 1

    // Determine level
    if (score >= 6) level = 'strong'
    else if (score >= 4) level = 'medium'

    return { score, level }
  }

  /**
   * Generate password reset token
   * @param {number} userId - User ID
   * @returns {Promise<Result>} Result containing reset token or error
   */
  async generatePasswordResetToken(userId) {
    return Result.fromAsync(async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const payload = {
        userId,
        type: 'password_reset',
        iat: Math.floor(Date.now() / 1000)
      }

      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' })
      return token
    })
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Result>} Result containing user ID or error
   */
  async verifyPasswordResetToken(token) {
    return Result.fromAsync(async () => {
      if (!token) {
        throw new Error('Token is required')
      }

      try {
        const decoded = jwt.verify(token, this.jwtSecret)

        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type')
        }

        return decoded.userId
      } catch (error) {
        throw new Error('Invalid or expired reset token')
      }
    })
  }
}

module.exports = UserAuthenticationService
