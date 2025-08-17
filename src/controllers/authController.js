const BaseController = require('../core/controllers/BaseController')
const ServiceRegistration = require('../core/di/ServiceRegistration')
const Result = require('../core/errors/Result')
const logger = require('../utils-api/logger')

class AuthController extends BaseController {
  constructor(authService = null) {
    super()
    this.authService = authService
  }

  getAuthService() {
    if (!this.authService) {
      this.authService = ServiceRegistration.getService('authService')
    }
    return this.authService
  }

  async register(req, res) {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['username', 'email', 'password'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      const result = await this.getAuthService().register(req.body)

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
      const result = await this.getAuthService().login(username, password)

      if (result.isSuccess) {
        logger.info('User logged in successfully', { username })
        return Result.success({ access_token: result.value.token })
      }

      logger.error('Login error', { error: result.error.message })
      return result
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
      const result = await this.getAuthService().getProfile(userId)

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

const authController = new AuthController()

module.exports = {
  register: authController.register.bind(authController),
  login: authController.login.bind(authController),
  logout: authController.logout.bind(authController),
  getProfile: authController.getProfile.bind(authController)
}
