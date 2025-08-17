const UserService = require('../core/services/UserService')
const UserAuthenticationService = require('../core/services/UserAuthenticationService')
const AuthenticationService = require('../core/services/AuthenticationService')
const userRepository = require('../repositories/userRepository')
const Result = require('../core/errors/Result')

class AuthService {
  constructor() {
    this.userService = new UserService(userRepository)
    this.userAuthService = new UserAuthenticationService(userRepository, process.env.JWT_SECRET)
    this.authService = new AuthenticationService(userRepository)
  }

  async register(userData) {
    return await this.userService.register(userData)
  }

  async login(username, password) {
    return Result.fromAsync(async () => {
      if (!username || !password) {
        throw new Error('Invalid credentials')
      }

      // Use UserAuthenticationService to authenticate user
      const authResult = await this.userAuthService.authenticateUser(username, password)
      if (!authResult.isSuccess) {
        throw new Error('Invalid credentials')
      }

      const user = authResult.value

      // Generate token using UserAuthenticationService
      const tokenResult = await this.userAuthService.generateToken(user.id, user.username)
      if (!tokenResult.isSuccess) {
        throw new Error('Failed to generate token')
      }

      // Remove password from user object
      const userWithoutPassword = { ...user }
      delete userWithoutPassword.password
      return { user: userWithoutPassword, token: tokenResult.value }
    })
  }

  async getProfile(userId) {
    if (!userId || userId === null || userId === undefined) {
      return Result.failure(new Error('User not found'))
    }

    const userResult = await this.userService.getById(userId)
    if (!userResult.isSuccess) {
      return Result.failure(new Error('User not found'))
    }

    return Result.success(userResult.value)
  }
}

module.exports = new AuthService()
