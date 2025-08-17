const BaseController = require('../core/controllers/BaseController')
const Result = require('../core/errors/Result')
const Either = require('../core/errors/Either')
const logger = require('../utils-api/logger')

/**
 * Authentication Controller following Single Responsibility Principle
 * Only handles HTTP request/response logic, delegates business logic to services
 */
class RefactoredAuthController extends BaseController {
  constructor(userAuthService, userService) {
    super()
    this.userAuthService = userAuthService
    this.userService = userService
  }

  async register(req, res) {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['username', 'email', 'password'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      const result = await this.userService.register(req.body)

      if (result.isSuccess) {
        logger.info('User registered successfully', { username: req.body.username })
        return Result.success({ message: 'User registered successfully' })
      }

      logger.error('Register error', { error: result.error.message })
      return result
    }, res, 201)
  }

  async login(req, res) {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['username', 'password'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      const { username, password } = req.body

      // Use Either monad for better error handling
      const loginResult = await Either.tryCatchAsync(async () => {
        // Authenticate user
        const authResult = await this.userAuthService.authenticateUser(username, password)
        if (!authResult.isSuccess) {
          throw new Error('Invalid credentials')
        }

        const user = authResult.value

        // Update last login
        await this.userAuthService.updateLastLogin(user.id)

        // Generate token
        const tokenResult = await this.userAuthService.generateToken(user.id, user.username)
        if (!tokenResult.isSuccess) {
          throw new Error('Failed to generate token')
        }

        return { token: tokenResult.value }
      })

      return loginResult.fold(
        (error) => {
          logger.error('Login error', { error, username })
          return Result.failure(new Error('Invalid credentials'))
        },
        (data) => {
          logger.info('User logged in successfully', { username })
          return Result.success({ access_token: data.token })
        }
      )
    }, res)
  }

  async logout(req, res) {
    await this.executeAction(async () => {
      logger.info('User logged out', { userId: req.user?.id })
      return Result.success({ message: 'User logged out successfully' })
    }, res)
  }

  async getProfile(req, res) {
    await this.executeAction(async () => {
      const userId = req.user?.id
      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.userService.getById(userId)

      if (result.isSuccess) {
        const user = result.value
        return Result.success({
          username: user.username,
          email: user.email
        })
      }

      logger.error('Get profile error', { error: result.error.message })
      return result
    }, res)
  }
}

module.exports = RefactoredAuthController
