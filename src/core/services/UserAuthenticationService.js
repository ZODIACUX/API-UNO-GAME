const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for user authentication operations
 * Follows Single Responsibility Principle - only handles authentication logic
 */
class UserAuthenticationService extends BaseService {
  constructor(userRepository, jwtSecret) {
    super(userRepository)
    this.jwtSecret = jwtSecret
  }

  async hashPassword(password) {
    return Result.fromAsync(async () => {
      return await bcrypt.hash(password, 10)
    })
  }

  async comparePassword(plainPassword, hashedPassword) {
    return Result.fromAsync(async () => {
      return await bcrypt.compare(plainPassword, hashedPassword)
    })
  }

  async generateToken(userId, username) {
    return Result.from(() => {
      return jwt.sign(
        { user_id: userId, username },
        this.jwtSecret,
        { expiresIn: '24h' }
      )
    })
  }

  async verifyToken(token) {
    return Result.from(() => {
      return jwt.verify(token, this.jwtSecret)
    })
  }

  async authenticateUser(username, password) {
    return Result.fromAsync(async () => {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      const userResult = await this.repository.findByUsernameWithPassword(username)
      if (!userResult.isSuccess || !userResult.value) {
        throw new Error('Invalid credentials')
      }

      const user = userResult.value
      if (!user.isActive) {
        throw new Error('User account is inactive')
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      return user
    })
  }

  async updateLastLogin(userId) {
    return Result.fromAsync(async () => {
      const updateResult = await this.repository.update(userId, {
        lastLogin: new Date()
      })

      if (!updateResult.isSuccess) {
        throw new Error('Failed to update last login')
      }

      return updateResult.value
    })
  }
}

module.exports = UserAuthenticationService
