const authService = require('../services/authService')
const ResponseHelper = require('../utils-api/responseHelper')
const logger = require('../utils-api/logger')

const register = async (req, res) => {
  try {
    const userData = req.body
    await authService.register(userData)

    logger.info('User registered successfully', { username: userData.username })

    // Respuesta simple sin ResponseHelper para mantener compatibilidad
    res.status(201).json({
      message: 'User registered successfully'
    })

  } catch (error) {
    logger.error('Register error', { error: error.message })

    if (error.message === 'User already exists') {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const result = await authService.login(username, password)

    logger.info('User logged in successfully', { username })

    res.json({
      access_token: result.token
    })

  } catch (error) {
    logger.error('Login error', { error: error.message })

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}

const logout = async (req, res) => {
  try {
    logger.info('User logged out', { userId: req.user?.id })

    res.json({
      message: 'User logged out successfully'
    })
  } catch (error) {
    logger.error('Logout error', { error: error.message })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await authService.getProfile(userId)

    res.json({
      username: user.username,
      email: user.email
    })
  } catch (error) {
    logger.error('Get profile error', { error: error.message })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile
}
