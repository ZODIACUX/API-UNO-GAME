const jwt = require('jsonwebtoken')
const { AppDataSource } = require('../config/data-source')
const { User } = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Get user from database
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: { id: decoded.userId || decoded.user_id },
      select: ['id', 'username', 'email', 'isActive']
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

const generateToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET
}
