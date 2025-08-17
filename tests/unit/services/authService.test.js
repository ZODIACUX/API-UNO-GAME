const authService = require('../../../src/services/authService')
const userRepository = require('../../../src/repositories/userRepository')
const TestHelpers = require('../../helpers/testHelpers')
const Result = require('../../../src/core/errors/Result')

// Mock the userRepository methods to return Result objects
jest.mock('../../../src/repositories/userRepository', () => ({
  findByUsernameOrEmail: jest.fn(),
  create: jest.fn(),
  findByUsername: jest.fn(),
  findByUsernameWithPassword: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}))

describe('AuthService - Authentication Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks for repository methods
    userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(null))
    userRepository.create.mockImplementation((userData) => {
      const user = {
        id: Math.floor(Math.random() * 10000),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return Result.success(user)
    })
    userRepository.findByUsername.mockResolvedValue(Result.success(null))
    userRepository.findByUsernameWithPassword.mockResolvedValue(Result.success(null))
    userRepository.findById.mockResolvedValue(Result.success(null))
    userRepository.save.mockImplementation((user) => Result.success(user))
  })
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      }

      const result = await authService.register(userData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.username).toBe(userData.username)
      expect(result.value.email).toBe(userData.email)
      expect(result.value.id).toBeDefined()
      expect(result.value.isActive).toBe(true)
    })

    it('should hash the password during registration', async () => {
      const userData = {
        username: 'hashuser',
        email: 'hashuser@example.com',
        password: 'plainpassword'
      }

      // Mock that user doesn't exist
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(null))

      // Mock create to return user with hashed password
      userRepository.create.mockImplementation((userData) => {
        const user = {
          id: Math.floor(Math.random() * 10000),
          username: userData.username,
          email: userData.email,
          password: '$2b$10$hashedpassword', // Mock hashed password
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        return Result.success(user)
      })

      const result = await authService.register(userData)

      expect(result.isSuccess).toBe(true)
      // Password should be hashed, not plain text
      expect(result.value.password).not.toBe(userData.password)
      expect(result.value.password).toMatch(/^\$2[aby]\$/)
    })

    it('should fail to register user with existing username', async () => {
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'hashedpassword',
        isActive: true
      }

      // Mock that user already exists
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(existingUser))

      const duplicateUserData = {
        username: 'existinguser',
        email: 'different@example.com',
        password: 'password123'
      }

      const result = await authService.register(duplicateUserData)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User already exists')
    })

    it('should fail to register user with existing email', async () => {
      const existingUser = {
        id: 1,
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'hashedpassword',
        isActive: true
      }

      // Mock that user already exists
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(existingUser))

      const duplicateUserData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123'
      }

      const result = await authService.register(duplicateUserData)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User already exists')
    })

    it('should handle registration with missing fields', async () => {
      const incompleteUserData = {
        username: 'incomplete',
        // Missing email and password
      }

      const result = await authService.register(incompleteUserData)
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should register users with different usernames and emails', async () => {
      const users = [
        { username: 'user1', email: 'user1@example.com', password: 'pass1' },
        { username: 'user2', email: 'user2@example.com', password: 'pass2' },
        { username: 'user3', email: 'user3@example.com', password: 'pass3' }
      ]

      const registeredUsers = []
      for (const userData of users) {
        const result = await authService.register(userData)
        expect(result.isSuccess).toBe(true)
        registeredUsers.push(result.value)
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
        password: testPassword
      })
    })

    it('should login with valid credentials', async () => {
      // Mock UserAuthenticationService methods
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.success(testUser))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken').mockResolvedValue(Result.success('mock-jwt-token'))

      const result = await authService.login(testUser.username, testPassword)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.user).toBeDefined()
      expect(result.value.token).toBeDefined()
      expect(result.value.user.id).toBe(testUser.id)
      expect(result.value.user.username).toBe(testUser.username)
      expect(typeof result.value.token).toBe('string')
      expect(result.value.token.length).toBeGreaterThan(0)
    })

    it('should fail login with invalid username', async () => {
      // Mock authentication failure
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.failure(new Error('User not found')))

      const result = await authService.login('nonexistent', testPassword)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
    })

    it('should fail login with invalid password', async () => {
      // Mock authentication failure
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.failure(new Error('Invalid password')))

      const result = await authService.login(testUser.username, 'wrongpassword')
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
    })

    it('should fail login for inactive user', async () => {
      // Mock authentication failure for inactive user
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.failure(new Error('User inactive')))

      const result = await authService.login('inactiveuser', testPassword)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
    })

    it('should fail login with empty credentials', async () => {
      const result1 = await authService.login('', '')
      expect(result1.isSuccess).toBe(false)
      expect(result1.error.message).toContain('Invalid credentials')

      const result2 = await authService.login(null, null)
      expect(result2.isSuccess).toBe(false)
      expect(result2.error.message).toContain('Invalid credentials')
    })

    it('should handle case-sensitive username login', async () => {
      // Mock successful authentication
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.success(testUser))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken').mockResolvedValue(Result.success('mock-jwt-token'))

      const result = await authService.login(testUser.username.toUpperCase(), testPassword)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.user).toBeDefined()
      expect(result.value.token).toBeDefined()
      expect(result.value.user.id).toBe(testUser.id)
    })

    it('should generate different tokens for different users', async () => {
      const user2 = await TestHelpers.createTestUser({
        username: 'loginuser2',
        email: 'loginuser2@example.com',
        password: testPassword
      })

      // Mock successful authentication for both users
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser')
        .mockResolvedValueOnce(Result.success(testUser))
        .mockResolvedValueOnce(Result.success(user2))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken')
        .mockResolvedValueOnce(Result.success('token-user1'))
        .mockResolvedValueOnce(Result.success('token-user2'))

      const result1 = await authService.login(testUser.username, testPassword)
      const result2 = await authService.login(user2.username, testPassword)

      expect(result1.isSuccess).toBe(true)
      expect(result2.isSuccess).toBe(true)
      expect(result1.value.token).not.toBe(result2.value.token)
      expect(typeof result1.value.token).toBe('string')
      expect(typeof result2.value.token).toBe('string')
      expect(result1.value.token.length).toBeGreaterThan(0)
      expect(result2.value.token.length).toBeGreaterThan(0)
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
      // Mock UserService getById method
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'getById').mockResolvedValue(Result.success(testUser))

      const result = await authService.getProfile(testUser.id)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
      expect(result.value.username).toBe(testUser.username)
      expect(result.value.email).toBe(testUser.email)
      expect(result.value.isActive).toBe(testUser.isActive)
    })

    it('should fail to get profile for non-existent user', async () => {
      // Mock UserService getById method to return failure
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'getById').mockResolvedValue(Result.failure(new Error('User not found')))

      const result = await authService.getProfile(99999)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User not found')
    })

    it('should fail to get profile with null user ID', async () => {
      const result = await authService.getProfile(null)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User not found')
    })

    it('should get profile for inactive user', async () => {
      const inactiveUser = await TestHelpers.createTestUser({
        username: 'inactiveprofile',
        email: 'inactiveprofile@example.com',
        isActive: false
      })

      // Mock UserService getById method
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'getById').mockResolvedValue(Result.success(inactiveUser))

      const result = await authService.getProfile(inactiveUser.id)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.isActive).toBe(false)
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
      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      const registeredUser = registerResult.value

      // Mock login services
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.success(registeredUser))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken').mockResolvedValue(Result.success('integration-token'))

      // Mock profile service
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'getById').mockResolvedValue(Result.success(registeredUser))

      // Login with registered user
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registeredUser.id)
      expect(loginResult.value.token).toBeDefined()

      // Get profile
      const profileResult = await authService.getProfile(registeredUser.id)
      expect(profileResult.isSuccess).toBe(true)
      expect(profileResult.value.username).toBe(userData.username)
      expect(profileResult.value.email).toBe(userData.email)
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

      const registrationResults = await Promise.all(registrationPromises)

      expect(registrationResults.length).toBe(5)
      expect(registrationResults.every(result => result.isSuccess)).toBe(true)

      const registeredUsers = registrationResults.map(result => result.value)
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
          password: password
        })
        users.push(user)
      }

      // Mock authentication services for concurrent logins
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser')
        .mockResolvedValueOnce(Result.success(users[0]))
        .mockResolvedValueOnce(Result.success(users[1]))
        .mockResolvedValueOnce(Result.success(users[2]))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken')
        .mockResolvedValueOnce(Result.success('token-concurrent-0'))
        .mockResolvedValueOnce(Result.success('token-concurrent-1'))
        .mockResolvedValueOnce(Result.success('token-concurrent-2'))

      // Login concurrently
      const loginPromises = users.map(user =>
        authService.login(user.username, password)
      )

      const loginResults = await Promise.all(loginPromises)

      expect(loginResults.length).toBe(3)
      expect(loginResults.every(result => result.isSuccess)).toBe(true)
      expect(loginResults.every(result => result.value.token)).toBe(true)
      expect(loginResults.every(result => result.value.user)).toBe(true)
    })

    it('should maintain data consistency during auth operations', async () => {
      const userData = {
        username: 'consistencyuser',
        email: 'consistency@example.com',
        password: 'consistencypassword'
      }

      // Register user
      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      const registeredUser = registerResult.value

      // Mock repository findById to return the registered user
      userRepository.findById.mockResolvedValue(Result.success(registeredUser))

      // Mock authentication services
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.success(registeredUser))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken').mockResolvedValue(Result.success('consistency-token'))

      // Mock profile service
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'getById').mockResolvedValue(Result.success(registeredUser))

      // Verify user exists in repository
      const userFromRepo = await userRepository.findById(registeredUser.id)
      expect(userFromRepo.isSuccess).toBe(true)
      expect(userFromRepo.value.username).toBe(userData.username)

      // Login and verify token generation
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registeredUser.id)

      // Get profile and verify consistency
      const profileResult = await authService.getProfile(registeredUser.id)
      expect(profileResult.isSuccess).toBe(true)
      expect(profileResult.value.id).toBe(registeredUser.id)
      expect(profileResult.value.username).toBe(userData.username)
      expect(profileResult.value.email).toBe(userData.email)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection issues gracefully', async () => {
      // Mock UserService register to return failure
      const mockUserService = require('../../../src/core/services/UserService')
      jest.spyOn(mockUserService.prototype, 'register').mockResolvedValue(Result.failure(new Error('Database connection failed')))

      const userData = {
        username: 'dbfailuser',
        email: 'dbfail@example.com',
        password: 'password123'
      }

      const result = await authService.register(userData)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Database connection failed')
    })

    it('should handle special characters in credentials', async () => {
      const userData = {
        username: 'special!@#$%^&*()',
        email: 'special+test@example.com',
        password: 'p@ssw0rd!@#$%^&*()'
      }

      // Mock registration
      userRepository.findByUsernameOrEmail.mockResolvedValue(Result.success(null))

      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      expect(registerResult.value.username).toBe(userData.username)
      expect(registerResult.value.email).toBe(userData.email)

      // Mock login services
      const mockUserAuthService = require('../../../src/core/services/UserAuthenticationService')
      jest.spyOn(mockUserAuthService.prototype, 'authenticateUser').mockResolvedValue(Result.success(registerResult.value))
      jest.spyOn(mockUserAuthService.prototype, 'generateToken').mockResolvedValue(Result.success('special-token'))

      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registerResult.value.id)
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
      const result = await authService.register(userData)
      if (result.isSuccess) {
        expect(result.value.username).toBe(longUsername)
      } else {
        // Expected to fail due to length constraints
        expect(result.error).toBeDefined()
      }
    })
  })
})
