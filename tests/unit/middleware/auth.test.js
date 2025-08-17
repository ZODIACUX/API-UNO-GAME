const { authenticateToken, generateToken } = require('../../../src/middleware/auth')
const ServiceRegistration = require('../../../src/core/di/ServiceRegistration')
const Result = require('../../../src/core/errors/Result')

// Mock the service registration
jest.mock('../../../src/core/di/ServiceRegistration')
jest.mock('jsonwebtoken')

describe('Auth Middleware', () => {
  let mockAuthenticationService
  let req, res, next

  beforeEach(() => {
    mockAuthenticationService = {
      extractTokenFromHeader: jest.fn(),
      verifyToken: jest.fn()
    }

    ServiceRegistration.getService = jest.fn().mockReturnValue(mockAuthenticationService)

    req = {
      headers: {}
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    next = jest.fn()
  })

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const mockUser = { id: 1, username: 'testuser' }
      req.headers.authorization = 'Bearer valid-token'

      mockAuthenticationService.extractTokenFromHeader.mockReturnValue(Result.success('valid-token'))
      mockAuthenticationService.verifyToken.mockResolvedValue(Result.success(mockUser))

      await authenticateToken(req, res, next)

      expect(mockAuthenticationService.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token')
      expect(mockAuthenticationService.verifyToken).toHaveBeenCalledWith('valid-token')
      expect(req.user).toBe(mockUser)
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should fail when authorization header is missing', async () => {
      req.headers.authorization = undefined

      mockAuthenticationService.extractTokenFromHeader.mockReturnValue(Result.failure(new Error('No token')))

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should fail when token extraction fails', async () => {
      req.headers.authorization = 'Invalid header'

      mockAuthenticationService.extractTokenFromHeader.mockReturnValue(Result.failure(new Error('Invalid format')))

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should fail when token verification fails', async () => {
      req.headers.authorization = 'Bearer invalid-token'

      mockAuthenticationService.extractTokenFromHeader.mockReturnValue(Result.success('invalid-token'))
      mockAuthenticationService.verifyToken.mockResolvedValue(Result.failure(new Error('Invalid token')))

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle unexpected errors', async () => {
      req.headers.authorization = 'Bearer valid-token'

      mockAuthenticationService.extractTokenFromHeader.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle async errors in token verification', async () => {
      req.headers.authorization = 'Bearer valid-token'

      mockAuthenticationService.extractTokenFromHeader.mockReturnValue(Result.success('valid-token'))
      mockAuthenticationService.verifyToken.mockRejectedValue(new Error('Database error'))

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('generateToken', () => {
    const jwt = require('jsonwebtoken')

    beforeEach(() => {
      jwt.sign = jest.fn()
    })

    it('should generate token with default settings', () => {
      const userId = 1
      const expectedToken = 'generated-token'

      jwt.sign.mockReturnValue(expectedToken)

      const result = generateToken(userId)

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret',
        { expiresIn: '24h' }
      )
      expect(result).toBe(expectedToken)
    })

    it('should use environment variables when available', () => {
      const originalSecret = process.env.JWT_SECRET
      const originalExpires = process.env.JWT_EXPIRES_IN

      process.env.JWT_SECRET = 'custom-secret'
      process.env.JWT_EXPIRES_IN = '1h'

      const userId = 1
      const expectedToken = 'generated-token'

      jwt.sign.mockReturnValue(expectedToken)

      const result = generateToken(userId)

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'custom-secret',
        { expiresIn: '1h' }
      )
      expect(result).toBe(expectedToken)

      // Restore original values
      process.env.JWT_SECRET = originalSecret
      process.env.JWT_EXPIRES_IN = originalExpires
    })

    it('should handle different user ID types', () => {
      const expectedToken = 'generated-token'
      jwt.sign.mockReturnValue(expectedToken)

      // Test with string ID
      generateToken('123')
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '123' },
        expect.any(String),
        expect.any(Object)
      )

      // Test with number ID
      generateToken(456)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 456 },
        expect.any(String),
        expect.any(Object)
      )
    })
  })
})
