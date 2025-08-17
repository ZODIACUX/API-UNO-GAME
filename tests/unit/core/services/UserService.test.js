const UserService = require('../../../../src/core/services/UserService')
const Result = require('../../../../src/core/errors/Result')

describe('UserService', () => {
  let userService
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findByUsernameOrEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findActiveUsers: jest.fn(),
      findByUsernameWithPassword: jest.fn()
    }
    userService = new UserService(mockRepository)
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(null))
      mockRepository.create.mockResolvedValue(Result.success({ id: 1, ...userData }))

      const result = await userService.register(userData)

      expect(result.isSuccess).toBe(true)
      expect(result.value.username).toBe('testuser')
      expect(mockRepository.findByUsernameOrEmail).toHaveBeenCalledWith('testuser', 'test@example.com')
    })

    it('should fail when user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockRepository.findByUsernameOrEmail.mockResolvedValue(Result.success({ id: 1 }))

      const result = await userService.register(userData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User already exists')
    })

    it('should fail when required fields are missing', async () => {
      const userData = {
        username: 'testuser'
      }

      const result = await userService.register(userData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Username, email, and password are required')
    })
  })

  describe('validateData', () => {
    it('should validate correct user data', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = userService.validateData(userData)

      expect(result.isSuccess).toBe(true)
    })

    it('should fail validation for short username', () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = userService.validateData(userData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Username must be at least 3 characters long')
    })

    it('should fail validation for invalid email', () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      }

      const result = userService.validateData(userData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Valid email is required')
    })

    it('should fail validation for short password', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      }

      const result = userService.validateData(userData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Password must be at least 6 characters long')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(userService.isValidEmail('test@example.com')).toBe(true)
      expect(userService.isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(userService.isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(userService.isValidEmail('invalid-email')).toBe(false)
      expect(userService.isValidEmail('@example.com')).toBe(false)
      expect(userService.isValidEmail('user@')).toBe(false)
      expect(userService.isValidEmail('user@domain')).toBe(false)
    })
  })

  describe('getById', () => {
    it('should return user when found', async () => {
      const userId = 1
      const user = { id: 1, username: 'testuser' }

      mockRepository.findById.mockResolvedValue(Result.success(user))

      const result = await userService.getById(userId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(user)
    })

    it('should fail when user ID is not provided', async () => {
      const result = await userService.getById(null)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('ID is required')
    })
  })

  describe('findActiveUsers', () => {
    it('should return active users', async () => {
      const activeUsers = [
        { id: 1, username: 'user1', isActive: true },
        { id: 2, username: 'user2', isActive: true }
      ]

      mockRepository.findActiveUsers.mockResolvedValue(Result.success(activeUsers))

      const result = await userService.findActiveUsers()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(activeUsers)
    })
  })
})
