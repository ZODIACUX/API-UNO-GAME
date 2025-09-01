const authService = require('../../../src/services/authService')
const Result = require('../../../src/core/errors/Result')

// Mock the SOLID services that the legacy authService now uses
const mockUserAuthService = {
  authenticateUser: jest.fn(),
  generateToken: jest.fn()
}

const mockUserService = {
  register: jest.fn(),
  getById: jest.fn()
}

// Mock ServiceRegistration to return SOLID-compliant services
jest.mock('../../../src/core/di/ServiceRegistration', () => ({
  registerServices: jest.fn(),
  getService: jest.fn((serviceName) => {
    if (serviceName === 'userAuthService') return mockUserAuthService
    if (serviceName === 'userService') return mockUserService
    return null
  })
}))

describe('AuthService - SOLID Architecture (Legacy Wrapper)', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks for SOLID services
    mockUserService.register.mockResolvedValue(Result.success({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      isActive: true
    }))

    mockUserAuthService.authenticateUser.mockResolvedValue(Result.success({
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    }))

    mockUserAuthService.generateToken.mockResolvedValue(Result.success('mock-jwt-token'))

    mockUserService.getById.mockResolvedValue(Result.success({
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    }))
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

    it('should delegate registration to SOLID UserService', async () => {
      const userData = {
        username: 'hashuser',
        email: 'hashuser@example.com',
        password: 'plainpassword'
      }

      // Mock SOLID UserService.register
      mockUserService.register.mockResolvedValue(Result.success({
        id: 1,
        username: 'hashuser',
        email: 'hashuser@example.com',
        password: '$2b$10$hashedpassword', // Mock hashed password
        isActive: true
      }))

      const result = await authService.register(userData)

      expect(mockUserService.register).toHaveBeenCalledWith(userData)
      expect(result.isSuccess).toBe(true)
      // Password should be hashed, not plain text
      expect(result.value.password).not.toBe(userData.password)
      expect(result.value.password).toMatch(/^\$2[aby]\$/)
    })

    it('should fail to register user with existing username', async () => {
      const duplicateUserData = {
        username: 'existinguser',
        email: 'different@example.com',
        password: 'password123'
      }

      // Mock SOLID UserService.register to return failure
      mockUserService.register.mockResolvedValue(Result.failure(new Error('User already exists')))

      const result = await authService.register(duplicateUserData)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User already exists')
      expect(mockUserService.register).toHaveBeenCalledWith(duplicateUserData)
    })

    it('should fail to register user with existing email', async () => {
      const duplicateUserData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123'
      }

      // Mock SOLID UserService.register to return failure
      mockUserService.register.mockResolvedValue(Result.failure(new Error('User already exists')))

      const result = await authService.register(duplicateUserData)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User already exists')
      expect(mockUserService.register).toHaveBeenCalledWith(duplicateUserData)
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

  describe('User Login - SOLID Architecture', () => {
    const testUser = {
      id: 1,
      username: 'loginuser',
      email: 'loginuser@example.com'
    }
    const testPassword = 'testpassword123'

    it('should login with valid credentials using SOLID services', async () => {
      // Mock SOLID UserAuthenticationService
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(testUser))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success('mock-jwt-token'))

      const result = await authService.login(testUser.username, testPassword)

      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith(testUser.username, testPassword)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(testUser.id, testUser.username)
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
      // Mock SOLID UserAuthenticationService failure
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.failure(new Error('User not found')))

      const result = await authService.login('nonexistent', testPassword)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith('nonexistent', testPassword)
    })

    it('should fail login with invalid password', async () => {
      // Mock SOLID UserAuthenticationService failure
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.failure(new Error('Invalid password')))

      const result = await authService.login(testUser.username, 'wrongpassword')
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith(testUser.username, 'wrongpassword')
    })

    it('should fail login for inactive user', async () => {
      // Mock SOLID UserAuthenticationService failure
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.failure(new Error('User inactive')))

      const result = await authService.login('inactiveuser', testPassword)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid credentials')
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith('inactiveuser', testPassword)
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

    it('should generate different tokens for different users with SOLID services', async () => {
      const user2 = {
        id: 2,
        username: 'loginuser2',
        email: 'loginuser2@example.com'
      }

      // Mock SOLID UserAuthenticationService for both users
      mockUserAuthService.authenticateUser
        .mockResolvedValueOnce(Result.success(testUser))
        .mockResolvedValueOnce(Result.success(user2))
      mockUserAuthService.generateToken
        .mockResolvedValueOnce(Result.success('token-user1'))
        .mockResolvedValueOnce(Result.success('token-user2'))

      const result1 = await authService.login(testUser.username, testPassword)
      const result2 = await authService.login(user2.username, testPassword)

      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledTimes(2)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledTimes(2)
      expect(result1.isSuccess).toBe(true)
      expect(result2.isSuccess).toBe(true)
      expect(result1.value.token).not.toBe(result2.value.token)
      expect(typeof result1.value.token).toBe('string')
      expect(typeof result2.value.token).toBe('string')
      expect(result1.value.token.length).toBeGreaterThan(0)
      expect(result2.value.token.length).toBeGreaterThan(0)
    })
  })

  describe('Get User Profile - SOLID Architecture', () => {
    const testUser = {
      id: 1,
      username: 'profileuser',
      email: 'profileuser@example.com',
      isActive: true
    }

    it('should get user profile successfully using SOLID UserService', async () => {
      // Mock SOLID UserService.getById
      mockUserService.getById.mockResolvedValue(Result.success(testUser))

      const result = await authService.getProfile(testUser.id)

      expect(mockUserService.getById).toHaveBeenCalledWith(testUser.id)
      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testUser.id)
      expect(result.value.username).toBe(testUser.username)
      expect(result.value.email).toBe(testUser.email)
      expect(result.value.isActive).toBe(testUser.isActive)
    })

    it('should fail to get profile for non-existent user', async () => {
      // Mock SOLID UserService.getById to return failure
      mockUserService.getById.mockResolvedValue(Result.failure(new Error('User not found')))

      const result = await authService.getProfile(99999)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User not found')
      expect(mockUserService.getById).toHaveBeenCalledWith(99999)
    })

    it('should fail to get profile with null user ID', async () => {
      const result = await authService.getProfile(null)
      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('User not found')
    })

    it('should get profile for inactive user', async () => {
      const inactiveUser = {
        id: 2,
        username: 'inactiveprofile',
        email: 'inactiveprofile@example.com',
        isActive: false
      }

      // Mock SOLID UserService.getById
      mockUserService.getById.mockResolvedValue(Result.success(inactiveUser))

      const result = await authService.getProfile(inactiveUser.id)

      expect(mockUserService.getById).toHaveBeenCalledWith(inactiveUser.id)
      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.isActive).toBe(false)
    })
  })

  describe('Authentication Integration Tests', () => {
    it('should complete full registration and login flow with SOLID architecture', async () => {
      const userData = {
        username: 'fullflowuser',
        email: 'fullflow@example.com',
        password: 'fullflowpassword'
      }

      const registeredUser = {
        id: 1,
        username: 'fullflowuser',
        email: 'fullflow@example.com'
      }

      // Mock SOLID UserService.register
      mockUserService.register.mockResolvedValue(Result.success(registeredUser))

      // Register user
      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      expect(mockUserService.register).toHaveBeenCalledWith(userData)

      // Mock SOLID UserAuthenticationService for login
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(registeredUser))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success('integration-token'))

      // Mock SOLID UserService for profile
      mockUserService.getById.mockResolvedValue(Result.success(registeredUser))

      // Login with registered user
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registeredUser.id)
      expect(loginResult.value.token).toBeDefined()
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith(userData.username, userData.password)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(registeredUser.id, registeredUser.username)

      // Get profile
      const profileResult = await authService.getProfile(registeredUser.id)
      expect(profileResult.isSuccess).toBe(true)
      expect(profileResult.value.username).toBe(userData.username)
      expect(profileResult.value.email).toBe(userData.email)
      expect(mockUserService.getById).toHaveBeenCalledWith(registeredUser.id)
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
        const user = {
          id: i + 1,
          username: `concurrentlogin${i}`,
          email: `concurrentlogin${i}@example.com`,
          password: password
        }
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

    it('should maintain data consistency during auth operations with SOLID architecture', async () => {
      const userData = {
        username: 'consistencyuser',
        email: 'consistency@example.com',
        password: 'consistencypassword'
      }

      const registeredUser = {
        id: 1,
        username: 'consistencyuser',
        email: 'consistency@example.com'
      }

      // Mock SOLID UserService.register
      mockUserService.register.mockResolvedValue(Result.success(registeredUser))

      // Register user
      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      expect(mockUserService.register).toHaveBeenCalledWith(userData)

      // Mock SOLID UserAuthenticationService for login
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(registeredUser))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success('consistency-token'))

      // Mock SOLID UserService for profile
      mockUserService.getById.mockResolvedValue(Result.success(registeredUser))

      // Login and verify token generation
      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registeredUser.id)
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith(userData.username, userData.password)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(registeredUser.id, registeredUser.username)

      // Get profile and verify consistency
      const profileResult = await authService.getProfile(registeredUser.id)
      expect(profileResult.isSuccess).toBe(true)
      expect(profileResult.value.id).toBe(registeredUser.id)
      expect(profileResult.value.username).toBe(userData.username)
      expect(profileResult.value.email).toBe(userData.email)
      expect(mockUserService.getById).toHaveBeenCalledWith(registeredUser.id)
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

    it('should handle special characters in credentials with SOLID services', async () => {
      const userData = {
        username: 'special!@#$%^&*()',
        email: 'special+test@example.com',
        password: 'p@ssw0rd!@#$%^&*()'
      }

      const registeredUser = {
        id: 1,
        username: 'special!@#$%^&*()',
        email: 'special+test@example.com'
      }

      // Mock SOLID UserService.register
      mockUserService.register.mockResolvedValue(Result.success(registeredUser))

      const registerResult = await authService.register(userData)
      expect(registerResult.isSuccess).toBe(true)
      expect(registerResult.value.username).toBe(userData.username)
      expect(registerResult.value.email).toBe(userData.email)
      expect(mockUserService.register).toHaveBeenCalledWith(userData)

      // Mock SOLID UserAuthenticationService for login
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(registeredUser))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success('special-token'))

      const loginResult = await authService.login(userData.username, userData.password)
      expect(loginResult.isSuccess).toBe(true)
      expect(loginResult.value.user.id).toBe(registerResult.value.id)
      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith(userData.username, userData.password)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(registeredUser.id, registeredUser.username)
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

