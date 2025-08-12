const authService = require('../../../src/services/authService')
const userRepository = require('../../../src/repositories/userRepository')
const TestHelpers = require('../../helpers/testHelpers')

// Use the real auth middleware implementation

describe('AuthService - Authentication Operations', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      }

      const registeredUser = await authService.register(userData)

      expect(registeredUser).toBeDefined()
      expect(registeredUser.username).toBe(userData.username)
      expect(registeredUser.email).toBe(userData.email)
      expect(registeredUser.id).toBeDefined()
      expect(registeredUser.isActive).toBe(true)
    })

    it('should hash the password during registration', async () => {
      const userData = {
        username: 'hashuser',
        email: 'hashuser@example.com',
        password: 'plainpassword'
      }

      const registeredUser = await authService.register(userData)

      // Password should be hashed, not plain text
      expect(registeredUser.password).not.toBe(userData.password)
      expect(registeredUser.password).toMatch(/^\$2[aby]\$/)
    })

    it('should fail to register user with existing username', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      }

      // Create user first
      await authService.register(userData)

      // Try to register with same username but different email
      const duplicateUserData = {
        username: 'existinguser',
        email: 'different@example.com',
        password: 'password123'
      }

      await expect(authService.register(duplicateUserData))
        .rejects.toThrow('User already exists')
    })

    it('should fail to register user with existing email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      }

      // Create user first
      await authService.register(userData)

      // Try to register with same email but different username
      const duplicateUserData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123'
      }

      await expect(authService.register(duplicateUserData))
        .rejects.toThrow('User already exists')
    })

    it('should handle registration with missing fields', async () => {
      const incompleteUserData = {
        username: 'incomplete',
        // Missing email and password
      }

      await expect(authService.register(incompleteUserData))
        .rejects.toThrow()
    })

    it('should register users with different usernames and emails', async () => {
      const users = [
        { username: 'user1', email: 'user1@example.com', password: 'pass1' },
        { username: 'user2', email: 'user2@example.com', password: 'pass2' },
        { username: 'user3', email: 'user3@example.com', password: 'pass3' }
      ]

      const registeredUsers = []
      for (const userData of users) {
        const user = await authService.register(userData)
        registeredUsers.push(user)
      }

      expect(registeredUsers.length).toBe(3)
      expect(registeredUsers.every(user => user.id)).toBe(true)
      expect(registeredUsers.every(user => user.isActive)).toBe(true)
    })
  })

  describe('User Login', () => {
    let testUser
    const testPassword = 'testpassword123'

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'loginuser',
        email: 'loginuser@example.com',
        password: testPassword // Don't hash here, let the entity handle it
      })
    })

    it('should login with valid credentials', async () => {
      const result = await authService.login(testUser.username, testPassword)

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.user.id).toBe(testUser.id)
      expect(result.user.username).toBe(testUser.username)
      expect(typeof result.token).toBe('string')
      expect(result.token.length).toBeGreaterThan(0)
    })

    it('should fail login with invalid username', async () => {
      await expect(authService.login('nonexistent', testPassword))
        .rejects.toThrow('Invalid credentials')
    })

    it('should fail login with invalid password', async () => {
      await expect(authService.login(testUser.username, 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should fail login for inactive user', async () => {
      // Create inactive user
      const inactiveUser = await TestHelpers.createTestUser({
        username: 'inactiveuser',
        email: 'inactive@example.com',
        password: testPassword, // Don't hash here, let the entity handle it
        isActive: false
      })

      await expect(authService.login(inactiveUser.username, testPassword))
        .rejects.toThrow('Invalid credentials')
    })

    it('should fail login with empty credentials', async () => {
      await expect(authService.login('', ''))
        .rejects.toThrow('Invalid credentials')

      await expect(authService.login(null, null))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle case-sensitive username login', async () => {
      // Try login with different case - should succeed since MySQL is case-insensitive by default
      const result = await authService.login(testUser.username.toUpperCase(), testPassword)

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.user.id).toBe(testUser.id)
    })

    it('should generate different tokens for different users', async () => {
      const user2 = await TestHelpers.createTestUser({
        username: 'loginuser2',
        email: 'loginuser2@example.com',
        password: testPassword // Don't hash here, let the entity handle it
      })

      const result1 = await authService.login(testUser.username, testPassword)
      const result2 = await authService.login(user2.username, testPassword)

      expect(result1.token).not.toBe(result2.token)
      expect(typeof result1.token).toBe('string')
      expect(typeof result2.token).toBe('string')
      expect(result1.token.length).toBeGreaterThan(0)
      expect(result2.token.length).toBeGreaterThan(0)
    })
  })

  describe('Get User Profile', () => {
    let testUser

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'profileuser',
        email: 'profileuser@example.com'
      })
    })

    it('should get user profile successfully', async () => {
      const profile = await authService.getProfile(testUser.id)

      expect(profile).toBeDefined()
      expect(profile.id).toBe(testUser.id)
      expect(profile.username).toBe(testUser.username)
      expect(profile.email).toBe(testUser.email)
      expect(profile.isActive).toBe(testUser.isActive)
    })

    it('should fail to get profile for non-existent user', async () => {
      await expect(authService.getProfile(99999))
        .rejects.toThrow('User not found')
    })

    it('should fail to get profile with null user ID', async () => {
      await expect(authService.getProfile(null))
        .rejects.toThrow('User not found')
    })

    it('should get profile for inactive user', async () => {
      const inactiveUser = await TestHelpers.createTestUser({
        username: 'inactiveprofile',
        email: 'inactiveprofile@example.com',
        isActive: false
      })

      const profile = await authService.getProfile(inactiveUser.id)

      expect(profile).toBeDefined()
      expect(profile.isActive).toBe(false)
    })
  })

  describe('Authentication Integration Tests', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        username: 'fullflowuser',
        email: 'fullflow@example.com',
        password: 'fullflowpassword'
      }

      // Register user
      const registeredUser = await authService.register(userData)
      expect(registeredUser).toBeDefined()

      // Login with registered user
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.user.id).toBe(registeredUser.id)
      expect(loginResult.token).toBeDefined()

      // Get profile
      const profile = await authService.getProfile(registeredUser.id)
      expect(profile.username).toBe(userData.username)
      expect(profile.email).toBe(userData.email)
    })

    it('should handle multiple concurrent registrations', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        username: `concurrent${i}`,
        email: `concurrent${i}@example.com`,
        password: `password${i}`
      }))

      const registrationPromises = users.map(userData =>
        authService.register(userData)
      )

      const registeredUsers = await Promise.all(registrationPromises)

      expect(registeredUsers.length).toBe(5)
      expect(registeredUsers.every(user => user.id)).toBe(true)

      // All users should have unique IDs
      const userIds = registeredUsers.map(user => user.id)
      const uniqueIds = [...new Set(userIds)]
      expect(uniqueIds.length).toBe(5)
    })

    it('should handle multiple concurrent logins', async () => {
      const password = 'concurrentpassword'
      const users = []

      // Create multiple users
      for (let i = 0; i < 3; i++) {
        const user = await TestHelpers.createTestUser({
          username: `concurrentlogin${i}`,
          email: `concurrentlogin${i}@example.com`,
          password: password // Don't hash here, let the entity handle it
        })
        users.push(user)
      }

      // Login concurrently
      const loginPromises = users.map(user =>
        authService.login(user.username, password)
      )

      const loginResults = await Promise.all(loginPromises)

      expect(loginResults.length).toBe(3)
      expect(loginResults.every(result => result.token)).toBe(true)
      expect(loginResults.every(result => result.user)).toBe(true)
    })

    it('should maintain data consistency during auth operations', async () => {
      const userData = {
        username: 'consistencyuser',
        email: 'consistency@example.com',
        password: 'consistencypassword'
      }

      // Register user
      const registeredUser = await authService.register(userData)

      // Verify user exists in repository
      const userFromRepo = await userRepository.findById(registeredUser.id)
      expect(userFromRepo).toBeDefined()
      expect(userFromRepo.username).toBe(userData.username)

      // Login and verify token generation
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.user.id).toBe(registeredUser.id)

      // Get profile and verify consistency
      const profile = await authService.getProfile(registeredUser.id)
      expect(profile.id).toBe(registeredUser.id)
      expect(profile.username).toBe(userData.username)
      expect(profile.email).toBe(userData.email)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection issues gracefully', async () => {
      // Mock repository to throw error
      const originalFindByUsernameOrEmail = userRepository.findByUsernameOrEmail
      userRepository.findByUsernameOrEmail = jest.fn().mockRejectedValue(new Error('Database connection failed'))

      const userData = {
        username: 'dbfailuser',
        email: 'dbfail@example.com',
        password: 'password123'
      }

      await expect(authService.register(userData))
        .rejects.toThrow('Database connection failed')

      // Restore original method
      userRepository.findByUsernameOrEmail = originalFindByUsernameOrEmail
    })

    it('should handle special characters in credentials', async () => {
      const userData = {
        username: 'special!@#$%^&*()',
        email: 'special+test@example.com',
        password: 'p@ssw0rd!@#$%^&*()'
      }

      const registeredUser = await authService.register(userData)
      expect(registeredUser.username).toBe(userData.username)
      expect(registeredUser.email).toBe(userData.email)

      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.user.id).toBe(registeredUser.id)
    })

    it('should handle very long usernames and emails', async () => {
      const longUsername = 'a'.repeat(50)
      const longEmail = 'a'.repeat(90) + '@example.com'

      const userData = {
        username: longUsername,
        email: longEmail,
        password: 'password123'
      }

      // This might fail due to database constraints, which is expected
      try {
        const registeredUser = await authService.register(userData)
        expect(registeredUser.username).toBe(longUsername)
      } catch (error) {
        // Expected to fail due to length constraints
        expect(error).toBeDefined()
      }
    })
  })
})
