const userRepository = require('../../../src/repositories/userRepository')
const TestHelpers = require('../../helpers/testHelpers')
const bcrypt = require('bcryptjs')
const Result = require('../../../src/core/errors/Result')

// Mock the userRepository methods
jest.mock('../../../src/repositories/userRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findByUsernameOrEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}))

describe('UserRepository CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Create User', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: await bcrypt.hash('password123', 12),
        isActive: true
      }

      const mockUser = {
        id: 1,
        username: userData.username,
        email: userData.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      userRepository.create.mockResolvedValue(Result.success(mockUser))

      const result = await userRepository.create(userData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBeDefined()
      expect(result.value.username).toBe(userData.username)
      expect(result.value.email).toBe(userData.email)
      expect(result.value.isActive).toBe(true)
      expect(result.value.createdAt).toBeDefined()
      expect(result.value.updatedAt).toBeDefined()
    })

    it('should create user with default isActive value', async () => {
      const userData = {
        username: 'defaultuser',
        email: 'defaultuser@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      const mockUser = {
        id: 2,
        username: userData.username,
        email: userData.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      userRepository.create.mockResolvedValue(Result.success(mockUser))

      const result = await userRepository.create(userData)

      expect(result.isSuccess).toBe(true)
      expect(result.value.isActive).toBe(true)
    })

    it('should fail to create user with duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      const mockUser = { id: 3, username: userData.username, email: userData.email }
      userRepository.create.mockResolvedValueOnce(Result.success(mockUser))

      const firstResult = await userRepository.create(userData)
      expect(firstResult.isSuccess).toBe(true)

      const duplicateUserData = {
        username: 'duplicateuser',
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      userRepository.create.mockResolvedValueOnce(Result.failure(new Error('Username already exists')))

      const duplicateResult = await userRepository.create(duplicateUserData)
      expect(duplicateResult.isSuccess).toBe(false)
    })

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      const mockUser = { id: 4, username: userData.username, email: userData.email }
      userRepository.create.mockResolvedValueOnce(Result.success(mockUser))

      const firstResult = await userRepository.create(userData)
      expect(firstResult.isSuccess).toBe(true)

      const duplicateUserData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      userRepository.create.mockResolvedValueOnce(Result.failure(new Error('Email already exists')))

      const duplicateResult = await userRepository.create(duplicateUserData)
      expect(duplicateResult.isSuccess).toBe(false)
    })
  })

  describe('Read User', () => {
    let testUser

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'readuser',
        email: 'readuser@example.com'
      })
    })

    it('should find user by ID', async () => {
      userRepository.findById.mockResolvedValue(Result.success(testUser))

      const result = await userRepository.findById(testUser.id)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
      expect(result.value.username).toBe(testUser.username)
      expect(result.value.email).toBe(testUser.email)
    })

    it('should return null for non-existent user ID', async () => {
      userRepository.findById.mockResolvedValue(Result.success(null))

      const result = await userRepository.findById(99999)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should find user by username', async () => {
      userRepository.findByUsername.mockResolvedValue(Result.success(testUser))

      const result = await userRepository.findByUsername(testUser.username)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
      expect(result.value.username).toBe(testUser.username)
    })

    it('should return null for non-existent username', async () => {
      userRepository.findByUsername.mockResolvedValue(Result.success(null))

      const result = await userRepository.findByUsername('nonexistent')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should find user by email', async () => {
      userRepository.findByEmail.mockResolvedValue(Result.success(testUser))

      const result = await userRepository.findByEmail(testUser.email)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
      expect(result.value.email).toBe(testUser.email)
    })

    it('should return null for non-existent email', async () => {
      userRepository.findByEmail.mockResolvedValue(Result.success(null))

      const result = await userRepository.findByEmail('nonexistent@example.com')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should find user by username or email (username match)', async () => {
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(testUser))

      const result = await userRepository.findByUsernameOrEmail(testUser.username, 'wrong@email.com')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
    })

    it('should find user by username or email (email match)', async () => {
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(testUser))

      const result = await userRepository.findByUsernameOrEmail('wrongusername', testUser.email)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
    })

    it('should return null when neither username nor email match', async () => {
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(null))

      const result = await userRepository.findByUsernameOrEmail('wrongusername', 'wrong@email.com')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should find all users', async () => {
      const users = [testUser, { id: 2, username: 'user2', email: 'user2@example.com' }]
      userRepository.findAll.mockResolvedValue(Result.success(users))

      const result = await userRepository.findAll()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBeGreaterThanOrEqual(2)
    })

    it('should find users with options', async () => {
      const activeUsers = [testUser]
      userRepository.findAll.mockResolvedValue(Result.success(activeUsers))

      const result = await userRepository.findAll({
        where: { isActive: true }
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.every(user => user.isActive)).toBe(true)
    })
  })

  describe('Update User', () => {
    let testUser

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'updateuser',
        email: 'updateuser@example.com'
      })
    })

    it('should update user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      }

      const updatedUser = { ...testUser, ...updateData }
      userRepository.update.mockResolvedValue(Result.success(true))
      userRepository.findById.mockResolvedValue(Result.success(updatedUser))

      const updateResult = await userRepository.update(testUser.id, updateData)

      expect(updateResult.isSuccess).toBe(true)
      expect(updateResult.value).toBe(true)

      const findResult = await userRepository.findById(testUser.id)
      expect(findResult.isSuccess).toBe(true)
      expect(findResult.value.username).toBe(updateData.username)
      expect(findResult.value.email).toBe(updateData.email)
    })

    it('should update partial user data', async () => {
      const updateData = {
        isActive: false
      }

      const updatedUser = { ...testUser, isActive: false }
      userRepository.update.mockResolvedValue(Result.success(true))
      userRepository.findById.mockResolvedValue(Result.success(updatedUser))

      const updateResult = await userRepository.update(testUser.id, updateData)

      expect(updateResult.isSuccess).toBe(true)
      expect(updateResult.value).toBe(true)

      const findResult = await userRepository.findById(testUser.id)
      expect(findResult.isSuccess).toBe(true)
      expect(findResult.value.isActive).toBe(false)
      expect(findResult.value.username).toBe(testUser.username) // Should remain unchanged
    })

    it('should return false for non-existent user update', async () => {
      const updateData = {
        username: 'nonexistent'
      }

      userRepository.update.mockResolvedValue(Result.success(false))

      const result = await userRepository.update(99999, updateData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should fail to update with duplicate username', async () => {
      const anotherUser = await TestHelpers.createTestUser({
        username: 'anotheruser',
        email: 'another@example.com'
      })

      const updateData = {
        username: anotherUser.username
      }

      userRepository.update.mockResolvedValue(Result.failure(new Error('Username already exists')))

      const result = await userRepository.update(testUser.id, updateData)
      expect(result.isSuccess).toBe(false)
    })
  })

  describe('Delete User', () => {
    let testUser

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'deleteuser',
        email: 'deleteuser@example.com'
      })
    })

    it('should delete user successfully', async () => {
      userRepository.delete.mockResolvedValue(Result.success(true))
      userRepository.findById.mockResolvedValue(Result.success(null))

      const deleteResult = await userRepository.delete(testUser.id)

      expect(deleteResult.isSuccess).toBe(true)
      expect(deleteResult.value).toBe(true)

      const findResult = await userRepository.findById(testUser.id)
      expect(findResult.isSuccess).toBe(true)
      expect(findResult.value).toBeNull()
    })

    it('should return false for non-existent user deletion', async () => {
      userRepository.delete.mockResolvedValue(Result.success(false))

      const result = await userRepository.delete(99999)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should not affect other users when deleting one user', async () => {
      const anotherUser = await TestHelpers.createTestUser({
        username: 'keepuser',
        email: 'keep@example.com'
      })

      userRepository.delete.mockResolvedValue(Result.success(true))
      userRepository.findById.mockResolvedValue(Result.success(anotherUser))

      const deleteResult = await userRepository.delete(testUser.id)

      expect(deleteResult.isSuccess).toBe(true)
      expect(deleteResult.value).toBe(true)

      const findResult = await userRepository.findById(anotherUser.id)
      expect(findResult.isSuccess).toBe(true)
      expect(findResult.value).toBeDefined()
      expect(findResult.value.id).toBe(anotherUser.id)
    })
  })
})
