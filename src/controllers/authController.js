const Result = require('../utils/Result')
const authService = require('../services/authService')
const logger = require('../utils/logger')

class AuthController {
  constructor() {
    this.authService = authService
  }

  validateRequired(fields, data) {
    const missing = fields.filter((field) => !data[field])
    if (missing.length > 0) {
      return Result.failure(new Error(`Missing required fields: ${missing.join(', ')}`))
    }
    return Result.success(data)
  }

  async executeAction(action, res, successStatus = 200) {
    try {
      const result = await action()
      if (result.isSuccess) {
        return res.status(successStatus).json(result.value)
      } else {
        const statusCode = result.error.message.includes('not found')
          ? 404
          : result.error.message.includes('Invalid credentials')
            ? 401
            : result.error.message.includes('already exists')
              ? 409
              : 400
        return res.status(statusCode).json({ error: result.error.message })
      }
    } catch (error) {
      logger.error('Controller error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  async register(req, res) {
    await this.executeAction(
      async () => {
        const validationResult = this.validateRequired(['username', 'email', 'password'], req.body)
        if (!validationResult.isSuccess) {
          return validationResult
        }

        const result = await this.authService.register(req.body)

        if (result.isSuccess) {
          logger.info('User registered successfully', { username: req.body.username })
          return Result.success({ message: 'User registered successfully' })
        }

        logger.error('Register error', { error: result.error.message })
        return result
      },
      res,
      201
    )
  }

  async login(req, res) {
    await this.executeAction(async () => {
      const validationResult = this.validateRequired(['username', 'password'], req.body)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      const { username, password } = req.body
      const result = await this.authService.login(username, password)

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
      const result = await this.authService.getProfile(userId)

      if (result.isSuccess) {
        const user = result.value
        return Result.success({
          username: user.username,
          email: user.email,
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
  getProfile: authController.getProfile.bind(authController),
}
