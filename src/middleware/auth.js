const jwt = require('jsonwebtoken')
const ServiceRegistration = require('../core/di/ServiceRegistration')

const authenticateToken = async (req, res, next) => {
  try {
    const authenticationService = ServiceRegistration.getService('authenticationService')

    const authHeader = req.headers['authorization']
    const tokenResult = authenticationService.extractTokenFromHeader(authHeader)

    if (!tokenResult.isSuccess) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const userResult = await authenticationService.verifyToken(tokenResult.value)

    if (!userResult.isSuccess) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = userResult.value
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

module.exports = {
  authenticateToken,
  generateToken
}
