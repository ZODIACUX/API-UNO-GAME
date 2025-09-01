const Result = require('../../../src/core/errors/Result')

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}))

// Create mock services following SOLID architecture
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

// Import the actual SOLID-compliant RefactoredAuthController
const RefactoredAuthController = require('../../../src/core/controllers/RefactoredAuthController')

describe('RefactoredAuthController - SOLID Architecture', () => {
  let authController, req, res

  beforeEach(() => {
    // Create controller with SOLID-compliant injected services
    authController = new RefactoredAuthController(mockUserAuthService, mockUserService)

    // Clear all mocks
    jest.clearAllMocks()

    // Reset SOLID service mocks
    mockUserAuthService.authenticateUser.mockReset()
    mockUserAuthService.generateToken.mockReset()
    mockUserService.register.mockReset()
    mockUserService.getById.mockReset()

    req = {
      body: {},
      user: { id: 1, username: 'testuser' }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('register', () => {
    it('should register user successfully with SOLID services', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      // Mock SOLID UserService.register
      mockUserService.register.mockResolvedValue(Result.success({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }))

      await authController.register(req, res)

      expect(mockUserService.register).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      })
    })

    it('should fail when required fields are missing', async () => {
      req.body = { username: 'testuser' } // missing email and password

      await authController.register(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username, email, and password are required'
      })
    })

    it('should handle registration errors with SOLID services', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      // Mock SOLID UserService.register failure
      mockUserService.register.mockResolvedValue(Result.failure(new Error('User already exists')))

      await authController.register(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'User already exists'
      })
    })
  })

  describe('login', () => {
    it('should login user successfully with SOLID services', async () => {
      req.body = { username: 'testuser', password: 'password123' }

      // Mock SOLID UserAuthenticationService
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(mockUser))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success({ token: 'fake-jwt-token' }))

      await authController.login(req, res)

      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123')
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(1, 'testuser')
      expect(res.json).toHaveBeenCalledWith({
        access_token: 'fake-jwt-token'
      })
    })

    it('should fail when credentials are missing', async () => {
      req.body = { username: 'testuser' } // missing password

      await authController.login(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username and password are required'
      })
    })

    it('should handle authentication errors with SOLID services', async () => {
      req.body = { username: 'testuser', password: 'wrongpassword' }

      // Mock SOLID UserAuthenticationService failure
      mockUserAuthService.authenticateUser.mockResolvedValue(
        Result.failure(new Error('Invalid credentials'))
      )

      await authController.login(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      })
    })

    it('should handle token generation errors', async () => {
      req.body = { username: 'testuser', password: 'password123' }

      const mockUser = { id: 1, username: 'testuser' }
      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(mockUser))
      mockUserAuthService.generateToken.mockResolvedValue(
        Result.failure(new Error('Token generation failed'))
      )

      await authController.login(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      })
    })
  })

  describe('logout', () => {
    it('should logout user successfully with SOLID architecture', async () => {
      await authController.logout(req, res)

      expect(res.json).toHaveBeenCalledWith({
        message: 'User logged out successfully'
      })
    })
  })

  describe('getProfile', () => {
    it('should get user profile successfully with SOLID services', async () => {
      req.user = { id: 1 }

      // Mock SOLID UserService.getById
      mockUserService.getById.mockResolvedValue(Result.success({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }))

      await authController.getProfile(req, res)

      expect(mockUserService.getById).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com'
      })
    })

    it('should fail when user is not authenticated', async () => {
      req.user = null

      await authController.getProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not authenticated'
      })
    })

    it('should handle profile retrieval errors with SOLID services', async () => {
      req.user = { id: 1 }

      // Mock SOLID UserService.getById failure
      mockUserService.getById.mockResolvedValue(Result.failure(new Error('User not found')))

      await authController.getProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      })
    })
  })
})

