const UserAuthenticationService = require('../../../../src/core/services/UserAuthenticationService')
const Result = require('../../../../src/core/errors/Result')

describe('UserAuthenticationService', () => {
  let userAuthService
  let mockUserRepository
  const jwtSecret = 'test-secret'

  beforeEach(() => {
    mockUserRepository = {
      findByUsernameWithPassword: jest.fn(),
      update: jest.fn()
    }
    userAuthService = new UserAuthenticationService(mockUserRepository, jwtSecret)
  })

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testpassword'
      const result = await userAuthService.hashPassword(password)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value).not.toBe(password)
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testpassword'
      const hashResult = await userAuthService.hashPassword(password)
      const hashedPassword = hashResult.value

      const result = await userAuthService.comparePassword(password, hashedPassword)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'testpassword'
      const wrongPassword = 'wrongpassword'
      const hashResult = await userAuthService.hashPassword(password)
      const hashedPassword = hashResult.value

      const result = await userAuthService.comparePassword(wrongPassword, hashedPassword)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate token successfully', async () => {
      const userId = 1
      const username = 'testuser'

      const result = await userAuthService.generateToken(userId, username)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(typeof result.value).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const userId = 1
      const username = 'testuser'

      const tokenResult = await userAuthService.generateToken(userId, username)
      const token = tokenResult.value

      const result = await userAuthService.verifyToken(token)

      expect(result.isSuccess).toBe(true)
      expect(result.value.user_id).toBe(userId)
      expect(result.value.username).toBe(username)
    })

    it('should fail for invalid token', async () => {
      const invalidToken = 'invalid.token.here'

      const result = await userAuthService.verifyToken(invalidToken)

      expect(result.isSuccess).toBe(false)
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const username = 'testuser'
      const password = 'testpassword'
      const hashedPassword = '$2a$10$hashedpassword'

      const mockUser = {
        id: 1,
        username,
        password: hashedPassword,
        isActive: true
      }

      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(
        Result.success(mockUser)
      )

      // Mock bcrypt compare directly
      const bcrypt = require('bcryptjs')
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

      const result = await userAuthService.authenticateUser(username, password)

      expect(result.isSuccess).toBe(true)
      expect(result.value.username).toBe(username)
    })

    it('should fail when username or password is missing', async () => {
      const result = await userAuthService.authenticateUser('', 'password')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Username and password are required')
    })

    it('should fail when user is not found', async () => {
      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(
        Result.success(null)
      )

      const result = await userAuthService.authenticateUser('nonexistent', 'password')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid credentials')
    })

    it('should fail when user is inactive', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        isActive: false
      }

      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(
        Result.success(mockUser)
      )

      const result = await userAuthService.authenticateUser('testuser', 'password')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User account is inactive')
    })
  })

  describe('updateLastLogin', () => {
    it('should update last login successfully', async () => {
      const userId = 1
      mockUserRepository.update.mockResolvedValue(Result.success(true))

      const result = await userAuthService.updateLastLogin(userId)

      expect(result.isSuccess).toBe(true)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        lastLogin: expect.any(Date)
      })
    })

    it('should fail when update fails', async () => {
      const userId = 1
      mockUserRepository.update.mockResolvedValue(
        Result.failure(new Error('Update failed'))
      )

      const result = await userAuthService.updateLastLogin(userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Failed to update last login')
    })
  })
})
