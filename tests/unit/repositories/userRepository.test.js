const userRepository = require('../../../src/repositories/userRepository')
const TestHelpers = require('../../helpers/testHelpers')
const bcrypt = require('bcryptjs')

describe('UserRepository CRUD Operations', () => {
  describe('Create User', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: await bcrypt.hash('password123', 12),
        isActive: true
      }

      const createdUser = await userRepository.create(userData)

      expect(createdUser).toBeDefined()
      expect(createdUser.id).toBeDefined()
      expect(createdUser.username).toBe(userData.username)
      expect(createdUser.email).toBe(userData.email)
      expect(createdUser.isActive).toBe(true)
      expect(createdUser.createdAt).toBeDefined()
      expect(createdUser.updatedAt).toBeDefined()
    })

    it('should create user with default isActive value', async () => {
      const userData = {
        username: 'defaultuser',
        email: 'defaultuser@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      const createdUser = await userRepository.create(userData)

      expect(createdUser.isActive).toBe(true)
    })

    it('should fail to create user with duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      await userRepository.create(userData)

      const duplicateUserData = {
        username: 'duplicateuser',
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      await expect(userRepository.create(duplicateUserData)).rejects.toThrow()
    })

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      await userRepository.create(userData)

      const duplicateUserData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 12)
      }

      await expect(userRepository.create(duplicateUserData)).rejects.toThrow()
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
      const foundUser = await userRepository.findById(testUser.id)

      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(testUser.id)
      expect(foundUser.username).toBe(testUser.username)
      expect(foundUser.email).toBe(testUser.email)
    })

    it('should return null for non-existent user ID', async () => {
      const foundUser = await userRepository.findById(99999)

      expect(foundUser).toBeNull()
    })

    it('should find user by username', async () => {
      const foundUser = await userRepository.findByUsername(testUser.username)

      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(testUser.id)
      expect(foundUser.username).toBe(testUser.username)
    })

    it('should return null for non-existent username', async () => {
      const foundUser = await userRepository.findByUsername('nonexistent')

      expect(foundUser).toBeNull()
    })

    it('should find user by email', async () => {
      const foundUser = await userRepository.findByEmail(testUser.email)

      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(testUser.id)
      expect(foundUser.email).toBe(testUser.email)
    })

    it('should return null for non-existent email', async () => {
      const foundUser = await userRepository.findByEmail('nonexistent@example.com')

      expect(foundUser).toBeNull()
    })

    it('should find user by username or email (username match)', async () => {
      const foundUser = await userRepository.findByUsernameOrEmail(testUser.username, 'wrong@email.com')

      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(testUser.id)
    })

    it('should find user by username or email (email match)', async () => {
      const foundUser = await userRepository.findByUsernameOrEmail('wrongusername', testUser.email)

      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(testUser.id)
    })

    it('should return null when neither username nor email match', async () => {
      const foundUser = await userRepository.findByUsernameOrEmail('wrongusername', 'wrong@email.com')

      expect(foundUser).toBeNull()
    })

    it('should find all users', async () => {
      await TestHelpers.createTestUser({
        username: 'user2',
        email: 'user2@example.com'
      })

      const users = await userRepository.findAll()

      expect(users).toBeDefined()
      expect(users.length).toBeGreaterThanOrEqual(2)
    })

    it('should find users with options', async () => {
      const users = await userRepository.findAll({
        where: { isActive: true }
      })

      expect(users).toBeDefined()
      expect(users.every(user => user.isActive)).toBe(true)
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

      const result = await userRepository.update(testUser.id, updateData)

      expect(result).toBe(true)

      const updatedUser = await userRepository.findById(testUser.id)
      expect(updatedUser.username).toBe(updateData.username)
      expect(updatedUser.email).toBe(updateData.email)
    })

    it('should update partial user data', async () => {
      const updateData = {
        isActive: false
      }

      const result = await userRepository.update(testUser.id, updateData)

      expect(result).toBe(true)

      const updatedUser = await userRepository.findById(testUser.id)
      expect(updatedUser.isActive).toBe(false)
      expect(updatedUser.username).toBe(testUser.username) // Should remain unchanged
    })

    it('should return false for non-existent user update', async () => {
      const updateData = {
        username: 'nonexistent'
      }

      const result = await userRepository.update(99999, updateData)

      expect(result).toBe(false)
    })

    it('should fail to update with duplicate username', async () => {
      const anotherUser = await TestHelpers.createTestUser({
        username: 'anotheruser',
        email: 'another@example.com'
      })

      const updateData = {
        username: anotherUser.username
      }

      await expect(userRepository.update(testUser.id, updateData)).rejects.toThrow()
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
      const result = await userRepository.delete(testUser.id)

      expect(result).toBe(true)

      const deletedUser = await userRepository.findById(testUser.id)
      expect(deletedUser).toBeNull()
    })

    it('should return false for non-existent user deletion', async () => {
      const result = await userRepository.delete(99999)

      expect(result).toBe(false)
    })

    it('should not affect other users when deleting one user', async () => {
      const anotherUser = await TestHelpers.createTestUser({
        username: 'keepuser',
        email: 'keep@example.com'
      })

      const result = await userRepository.delete(testUser.id)

      expect(result).toBe(true)

      const remainingUser = await userRepository.findById(anotherUser.id)
      expect(remainingUser).toBeDefined()
      expect(remainingUser.id).toBe(anotherUser.id)
    })
  })
})
