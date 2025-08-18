const BaseController = require('../../../../src/core/controllers/BaseController')
const Result = require('../../../../src/core/errors/Result')

describe('BaseController', () => {
  let controller
  let mockRes

  beforeEach(() => {
    controller = new BaseController()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('handleResult', () => {
    it('should handle successful result', () => {
      const successResult = Result.success({ message: 'Success' })

      controller.handleResult(successResult, mockRes, 201)

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Success' }
      })
    })

    it('should handle failed result', () => {
      const failureResult = Result.failure(new Error('Test error'))

      controller.handleResult(failureResult, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error'
      })
    })

    it('should use default status code 200 for success', () => {
      const successResult = Result.success({ data: 'test' })

      controller.handleResult(successResult, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
    })
  })

  describe('handleError', () => {
    it('should handle error with default status', () => {
      const error = new Error('Generic error')

      controller.handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Generic error'
      })
    })

    it('should handle error without message', () => {
      const error = new Error()

      controller.handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'An error occurred'
      })
    })
  })

  describe('getStatusCodeFromError', () => {
    it('should return 404 for not found errors', () => {
      const error = new Error('User not found')
      expect(controller.getStatusCodeFromError(error)).toBe(404)
    })

    it('should return 409 for already exists errors', () => {
      const error = new Error('User already exists')
      expect(controller.getStatusCodeFromError(error)).toBe(409)
    })

    it('should return 400 for invalid errors', () => {
      const error = new Error('Invalid input')
      expect(controller.getStatusCodeFromError(error)).toBe(400)
    })

    it('should return 400 for required field errors', () => {
      const error = new Error('Username is required')
      expect(controller.getStatusCodeFromError(error)).toBe(400)
    })

    it('should return 401 for unauthorized errors', () => {
      const error = new Error('Unauthorized access')
      expect(controller.getStatusCodeFromError(error)).toBe(401)
    })

    it('should return 403 for forbidden errors', () => {
      const error = new Error('Forbidden access')
      expect(controller.getStatusCodeFromError(error)).toBe(403)
    })

    it('should return 500 for unknown errors', () => {
      const error = new Error('Something went wrong')
      expect(controller.getStatusCodeFromError(error)).toBe(500)
    })
  })

  describe('validateRequired', () => {
    it('should pass validation when all required fields are present', () => {
      const fields = ['username', 'email']
      const body = { username: 'john', email: 'john@example.com', extra: 'field' }

      const result = controller.validateRequired(fields, body)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(body)
    })

    it('should fail validation when required fields are missing', () => {
      const fields = ['username', 'email', 'password']
      const body = { username: 'john' }

      const result = controller.validateRequired(fields, body)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Required fields missing: email, password')
    })

    it('should fail validation for empty string values', () => {
      const fields = ['username']
      const body = { username: '' }

      const result = controller.validateRequired(fields, body)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Required fields missing: username')
    })

    it('should pass validation for empty array', () => {
      const fields = []
      const body = { username: 'john' }

      const result = controller.validateRequired(fields, body)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(body)
    })
  })

  describe('executeAction', () => {
    it('should execute successful action', async () => {
      const action = jest.fn().mockResolvedValue(Result.success({ data: 'test' }))

      await controller.executeAction(action, mockRes, 201)

      expect(action).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { data: 'test' }
      })
    })

    it('should handle action failure', async () => {
      const action = jest.fn().mockResolvedValue(Result.failure(new Error('Action failed')))

      await controller.executeAction(action, mockRes)

      expect(action).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Action failed'
      })
    })

    it('should handle thrown errors', async () => {
      const action = jest.fn().mockRejectedValue(new Error('Thrown error'))

      await controller.executeAction(action, mockRes)

      expect(action).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Thrown error'
      })
    })
  })
})
