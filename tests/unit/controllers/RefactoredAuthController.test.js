const RefactoredAuthController = require('../../../src/controllers/RefactoredAuthController')
const Result = require('../../../src/core/errors/Result')

describe('RefactoredAuthController', () => {
  let controller
  let mockUserAuthService
  let mockUserService
  let mockReq
  let mockRes

  beforeEach(() => {
    mockUserAuthService = {
      authenticateUser: jest.fn(),
      updateLastLogin: jest.fn(),
      generateToken: jest.fn()
    }

    mockUserService = {
      register: jest.fn(),
      getById: jest.fn()
    }

    controller = new RefactoredAuthController(mockUserAuthService, mockUserService)

    mockReq = {
      body: {},
      user: null
    }

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    // Mock logger to avoid console output during tests
    jest.mock('../../../src/utils-api/logger', () => ({
      info: jest.fn(),
      error: jest.fn()
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockUserService.register.mockResolvedValue(Result.success({ id: 1 }))

      await controller.register(mockReq, mockRes)

      expect(mockUserService.register).toHaveBeenCalledWith(mockReq.body)
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'User registered successfully' }
      })
    })

    it('should fail when required fields are missing', async () => {
      mockReq.body = {
        username: 'testuser'
        // missing email and password
      }

      await controller.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Required fields missing: email, password'
      })
    })

    it('should handle registration failure', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockUserService.register.mockResolvedValue(
        Result.failure(new Error('User already exists'))
      )

      await controller.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(409)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User already exists'
      })
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      }

      const mockUser = { id: 1, username: 'testuser' }
      const mockToken = 'jwt-token-123'

      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(mockUser))
      mockUserAuthService.updateLastLogin.mockResolvedValue(Result.success(true))
      mockUserAuthService.generateToken.mockResolvedValue(Result.success(mockToken))

      await controller.login(mockReq, mockRes)

      expect(mockUserAuthService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123')
      expect(mockUserAuthService.updateLastLogin).toHaveBeenCalledWith(1)
      expect(mockUserAuthService.generateToken).toHaveBeenCalledWith(1, 'testuser')
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { access_token: mockToken }
      })
    })

    it('should fail when required fields are missing', async () => {
      mockReq.body = {
        username: 'testuser'
        // missing password
      }

      await controller.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Required fields missing: password'
      })
    })

    it('should handle authentication failure', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'wrongpassword'
      }

      mockUserAuthService.authenticateUser.mockResolvedValue(
        Result.failure(new Error('Invalid credentials'))
      )

      await controller.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      })
    })

    it('should handle token generation failure', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      }

      const mockUser = { id: 1, username: 'testuser' }

      mockUserAuthService.authenticateUser.mockResolvedValue(Result.success(mockUser))
      mockUserAuthService.updateLastLogin.mockResolvedValue(Result.success(true))
      mockUserAuthService.generateToken.mockResolvedValue(
        Result.failure(new Error('Token generation failed'))
      )

      await controller.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      })
    })

    it('should handle unexpected errors during login', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      }

      // Simulate an unexpected error
      mockUserAuthService.authenticateUser.mockRejectedValue(new Error('Database connection failed'))

      await controller.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      })
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockReq.user = { id: 1 }

      await controller.logout(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'User logged out successfully' }
      })
    })

    it('should logout even without user in request', async () => {
      mockReq.user = null

      await controller.logout(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'User logged out successfully' }
      })
    })
  })

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      mockReq.user = { id: 1 }

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }

      mockUserService.getById.mockResolvedValue(Result.success(mockUser))

      await controller.getProfile(mockReq, mockRes)

      expect(mockUserService.getById).toHaveBeenCalledWith(1)
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'testuser',
          email: 'test@example.com'
        }
      })
    })

    it('should fail when user is not authenticated', async () => {
      mockReq.user = null

      await controller.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated'
      })
    })

    it('should fail when user ID is missing', async () => {
      mockReq.user = {}

      await controller.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated'
      })
    })

    it('should handle user service failure', async () => {
      mockReq.user = { id: 1 }

      mockUserService.getById.mockResolvedValue(
        Result.failure(new Error('User not found'))
      )

      await controller.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      })
    })
  })

  describe('error handling', () => {
    it('should handle unexpected errors in register', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockUserService.register.mockRejectedValue(new Error('Database error'))

      await controller.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      })
    })

    it('should handle unexpected errors in getProfile', async () => {
      mockReq.user = { id: 1 }

      mockUserService.getById.mockRejectedValue(new Error('Service unavailable'))

      await controller.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service unavailable'
      })
    })
  })

  describe('constructor', () => {
    it('should initialize with provided services', () => {
      const newController = new RefactoredAuthController(mockUserAuthService, mockUserService)

      expect(newController.userAuthService).toBe(mockUserAuthService)
      expect(newController.userService).toBe(mockUserService)
    })
  })
})
