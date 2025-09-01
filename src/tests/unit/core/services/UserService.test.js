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

      mockRepository.findByUsernameOrEmail.mockResolvedValue(Result.failure(new Error('Not found')))
      mockRepository.create.mockResolvedValue(Result.success({ id: 1, username: 'testuser', email: 'test@example.com' }))

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
      expect(result.error.message).toBe('User already exists with this username or email')
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

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const user = { id: 1, username: 'testuser' }
      mockRepository.findByUsername = jest.fn().mockResolvedValue(Result.success(user))

      const result = await userService.findByUsername('testuser')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(user)
    })

    it('should fail when username is not provided', async () => {
      const result = await userService.findByUsername('')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Username is required')
    })
  })

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = { id: 1, email: 'test@example.com' }
      mockRepository.findByEmail = jest.fn().mockResolvedValue(Result.success(user))

      const result = await userService.findByEmail('test@example.com')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(user)
    })

    it('should fail when email is not provided', async () => {
      const result = await userService.findByEmail('')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Email is required')
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
      expect(result.error.message).toBe('User ID is required')
    })
  })

  describe('getActiveUsers', () => {
    it('should return active users', async () => {
      const activeUsers = [
        { id: 1, username: 'user1', isActive: true },
        { id: 2, username: 'user2', isActive: true }
      ]

      mockRepository.findActiveUsers.mockResolvedValue(Result.success(activeUsers))

      const result = await userService.getActiveUsers()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(activeUsers)
    })
  })

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 1
      const profileData = { username: 'newusername' }
      const updatedUser = { id: 1, username: 'newusername', email: 'test@example.com' }

      mockRepository.update.mockResolvedValue(Result.success(updatedUser))

      const result = await userService.updateProfile(userId, profileData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(updatedUser)
    })

    it('should fail when user ID is not provided', async () => {
      const result = await userService.updateProfile(null, {})

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User ID is required')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 1
      const currentPassword = 'oldpassword'
      const newPassword = 'newpassword'
      const user = { id: 1, password: '$2b$12$hashedoldpassword' }

      mockRepository.findById.mockResolvedValue(Result.success(user))
      mockRepository.update.mockResolvedValue(Result.success({}))

      // Mock bcrypt
      const bcrypt = require('bcryptjs')
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2b$12$hashednewpassword')

      const result = await userService.changePassword(userId, currentPassword, newPassword)

      expect(result.isSuccess).toBe(true)
      expect(result.value.success).toBe(true)
    })

    it('should fail when required fields are missing', async () => {
      const result = await userService.changePassword(null, '', '')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User ID, current password, and new password are required')
    })
  })
})
