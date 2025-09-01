
/**
 * Refactored Auth Controller - Single Responsibility Principle (SRP)
 * Single Responsibility: Handle HTTP request/response logic only
 * Delegates business logic to injected services
 */
class RefactoredAuthController {
  constructor(userAuthService, userService) {
    this.userAuthService = userAuthService
    this.userService = userService
  }

  /**
   * Register user endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { username, email, password } = req.body

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Username, email, and password are required'
        })
      }

      // Register user using service
      const registerResult = await this.userService.register({
        username,
        email,
        password
      })

      if (!registerResult.isSuccess) {
        return res.status(400).json({
          error: registerResult.error.message
        })
      }

      // Generate token for immediate login
      const tokenResult = await this.userAuthService.generateToken(
        registerResult.value.id,
        registerResult.value.username
      )

      if (!tokenResult.isSuccess) {
        return res.status(500).json({
          error: 'User registered but token generation failed'
        })
      }

      res.status(201).json({
        message: 'User registered successfully',
        access_token: tokenResult.value
      })

    } catch (error) {
      console.error('Register error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Login user endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { username, password } = req.body

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          error: 'Username and password are required'
        })
      }

      // Authenticate user
      const authResult = await this.userAuthService.authenticateUser(username, password)

      if (!authResult.isSuccess) {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }

      // Generate token
      const tokenResult = await this.userAuthService.generateToken(
        authResult.value.id,
        authResult.value.username
      )

      if (!tokenResult.isSuccess) {
        return res.status(500).json({
          error: 'Authentication successful but token generation failed'
        })
      }

      res.json({
        access_token: tokenResult.value
      })

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Logout user endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // In stateless JWT authentication, logout is handled client-side
      // by removing the token from client storage
      res.json({
        message: 'User logged out successfully'
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get user profile endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      // Get user profile
      const profileResult = await this.userService.getById(userId)

      if (!profileResult.isSuccess) {
        return res.status(404).json({
          error: 'User not found'
        })
      }

      const user = profileResult.value

      res.json({
        username: user.username,
        email: user.email
      })

    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Change password endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const userId = req.user?.id
      const { currentPassword, newPassword } = req.body

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Current password and new password are required'
        })
      }

      // Change password using service
      const changeResult = await this.userService.changePassword(
        userId,
        currentPassword,
        newPassword
      )

      if (!changeResult.isSuccess) {
        return res.status(400).json({
          error: changeResult.error.message
        })
      }

      res.json({
        message: 'Password changed successfully'
      })

    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Update user profile endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user?.id
      const profileData = req.body

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      // Update profile using service
      const updateResult = await this.userService.updateProfile(userId, profileData)

      if (!updateResult.isSuccess) {
        return res.status(400).json({
          error: updateResult.error.message
        })
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          username: updateResult.value.username,
          email: updateResult.value.email
        }
      })

    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}

module.exports = RefactoredAuthController
