const jwt = require('jsonwebtoken')
const Result = require('../errors/Result')

class AuthenticationService {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  generateToken(userId) {
    return Result.from(() => {
      return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )
    })
  }

  async verifyToken(token) {
    return Result.fromAsync(async () => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret')
      const userResult = await this.userRepository.findById(decoded.userId)

      if (!userResult.isSuccess) {
        throw new Error('User not found')
      }

      const user = userResult.value
      if (!user || !user.isActive) {
        throw new Error('User is not active')
      }

      return user
    })
  }

  extractTokenFromHeader(authHeader) {
    return Result.from(() => {
      if (!authHeader) {
        throw new Error('Authorization header missing')
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        throw new Error('Token missing from authorization header')
      }

      return token
    })
  }
}

module.exports = AuthenticationService
