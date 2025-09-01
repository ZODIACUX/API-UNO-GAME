const AuthenticationService = require('../../../../src/core/services/AuthenticationService')
const Result = require('../../../../src/core/errors/Result')
const jwt = require('jsonwebtoken')

jest.mock('jsonwebtoken')

describe('AuthenticationService', () => {
  let authService
  let mockUserRepository

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn()
    }
    authService = new AuthenticationService(mockUserRepository)
    jest.clearAllMocks()
  })

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const userId = 123
      const expectedToken = 'mock.jwt.token'

      jwt.sign.mockReturnValue(expectedToken)

      const result = authService.generateToken(userId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(expectedToken)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret',
        { expiresIn: '24h' }
      )
    })

    it('should handle token generation errors', () => {
      const userId = 123
      const error = new Error('JWT Error')

      jwt.sign.mockImplementation(() => {
        throw error
      })

      const result = authService.generateToken(userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token and return user', async () => {
      const token = 'valid.jwt.token'
      const decoded = { userId: 123 }
      const user = { id: 123, username: 'testuser', isActive: true }

      jwt.verify.mockReturnValue(decoded)
      mockUserRepository.findById.mockResolvedValue(Result.success(user))

      const result = await authService.verifyToken(token)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(user)
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret')
    })

    it('should fail when token is invalid', async () => {
      const token = 'invalid.jwt.token'
      const error = new Error('Invalid token')

      jwt.verify.mockImplementation(() => {
        throw error
      })

      const result = await authService.verifyToken(token)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })

    it('should fail when user is not found', async () => {
      const token = 'valid.jwt.token'
      const decoded = { userId: 123 }

      jwt.verify.mockReturnValue(decoded)
      mockUserRepository.findById.mockResolvedValue(Result.failure(new Error('User not found')))

      const result = await authService.verifyToken(token)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User not found')
    })

    it('should fail when user is not active', async () => {
      const token = 'valid.jwt.token'
      const decoded = { userId: 123 }
      const user = { id: 123, username: 'testuser', isActive: false }

      jwt.verify.mockReturnValue(decoded)
      mockUserRepository.findById.mockResolvedValue(Result.success(user))

      const result = await authService.verifyToken(token)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User is not active')
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid authorization header', () => {
      const authHeader = 'Bearer valid.jwt.token'

      const result = authService.extractTokenFromHeader(authHeader)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe('valid.jwt.token')
    })

    it('should fail when authorization header is missing', () => {
      const result = authService.extractTokenFromHeader(null)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Authorization header missing')
    })

    it('should fail when token is missing from header', () => {
      const authHeader = 'Bearer'

      const result = authService.extractTokenFromHeader(authHeader)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Token missing from authorization header')
    })

    it('should fail when authorization header format is invalid', () => {
      const authHeader = 'InvalidFormat'

      const result = authService.extractTokenFromHeader(authHeader)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Token missing from authorization header')
    })
  })
})
