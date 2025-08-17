const ValidationMiddleware = require('../../../../src/core/middleware/ValidationMiddleware')

describe('ValidationMiddleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {}
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    mockNext = jest.fn()
  })

  describe('validateBody', () => {
    it('should pass validation with valid data', () => {
      const schema = {
        username: { required: true, type: 'string', minLength: 3 },
        age: { required: true, type: 'number', min: 18 }
      }
      mockReq.body = { username: 'john', age: 25 }

      const middleware = ValidationMiddleware.validateBody(schema)
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.validatedBody).toBe(mockReq.body)
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should fail validation with invalid data', () => {
      const schema = {
        username: { required: true, type: 'string', minLength: 3 }
      }
      mockReq.body = { username: 'jo' }

      const middleware = ValidationMiddleware.validateBody(schema)
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('username must be at least 3 characters long')
      })
    })

    it('should fail validation with missing required fields', () => {
      const schema = {
        username: { required: true },
        email: { required: true }
      }
      mockReq.body = { username: 'john' }

      const middleware = ValidationMiddleware.validateBody(schema)
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('email is required')
      })
    })
  })

  describe('validateParams', () => {
    it('should validate URL parameters', () => {
      const schema = {
        id: { required: true, type: 'string' }
      }
      mockReq.params = { id: '123' }

      const middleware = ValidationMiddleware.validateParams(schema)
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.validatedParams).toBe(mockReq.params)
    })
  })

  describe('validateQuery', () => {
    it('should validate query parameters', () => {
      const schema = {
        page: { type: 'string' },
        limit: { type: 'string' }
      }
      mockReq.query = { page: '1', limit: '10' }

      const middleware = ValidationMiddleware.validateQuery(schema)
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.validatedQuery).toBe(mockReq.query)
    })
  })

  describe('validateData', () => {
    it('should validate data against schema', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { type: 'number', min: 0, max: 120 }
      }
      const data = { name: 'John', age: 25 }

      const result = ValidationMiddleware.validateData(data, schema)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(data)
    })

    it('should fail with invalid schema', () => {
      const result = ValidationMiddleware.validateData({}, null)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid validation schema')
    })

    it('should collect multiple validation errors', () => {
      const schema = {
        username: { required: true, minLength: 5 },
        email: { required: true },
        age: { required: true, type: 'number' }
      }
      const data = { username: 'jo', age: 'not a number' }

      const result = ValidationMiddleware.validateData(data, schema)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('username must be at least 5 characters long')
      expect(result.error.message).toContain('email is required')
      expect(result.error.message).toContain('age must be of type number')
    })
  })

  describe('validateField', () => {
    it('should validate required fields', () => {
      const errors = ValidationMiddleware.validateField('username', undefined, { required: true })
      expect(errors).toContain('username is required')
    })

    it('should validate type constraints', () => {
      const errors = ValidationMiddleware.validateField('age', 'not a number', { type: 'number' })
      expect(errors).toContain('age must be of type number')
    })

    it('should validate string length constraints', () => {
      let errors = ValidationMiddleware.validateField('password', 'abc', { minLength: 6 })
      expect(errors).toContain('password must be at least 6 characters long')

      errors = ValidationMiddleware.validateField('bio', 'a'.repeat(501), { maxLength: 500 })
      expect(errors).toContain('bio cannot exceed 500 characters')
    })

    it('should validate number range constraints', () => {
      let errors = ValidationMiddleware.validateField('age', 5, { min: 18 })
      expect(errors).toContain('age must be at least 18')

      errors = ValidationMiddleware.validateField('score', 150, { max: 100 })
      expect(errors).toContain('score cannot exceed 100')
    })

    it('should validate enum constraints', () => {
      const errors = ValidationMiddleware.validateField('status', 'invalid', {
        enum: ['active', 'inactive', 'pending']
      })
      expect(errors).toContain('status must be one of: active, inactive, pending')
    })

    it('should validate pattern constraints', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const errors = ValidationMiddleware.validateField('email', 'invalid-email', {
        pattern: emailPattern
      })
      expect(errors).toContain('email format is invalid')
    })

    it('should validate custom constraints', () => {
      const customValidator = (value) => value === 'special' || 'Must be special value'
      const errors = ValidationMiddleware.validateField('custom', 'normal', {
        custom: customValidator
      })
      expect(errors).toContain('Must be special value')
    })

    it('should pass custom validation when valid', () => {
      const customValidator = (value) => value === 'special' || 'Must be special value'
      const errors = ValidationMiddleware.validateField('custom', 'special', {
        custom: customValidator
      })
      expect(errors).toHaveLength(0)
    })

    it('should skip validation for optional fields when value is undefined', () => {
      const errors = ValidationMiddleware.validateField('optional', undefined, {
        type: 'string',
        minLength: 5
      })
      expect(errors).toHaveLength(0)
    })

    it('should validate array type', () => {
      let errors = ValidationMiddleware.validateField('tags', ['tag1', 'tag2'], { type: 'array' })
      expect(errors).toHaveLength(0)

      errors = ValidationMiddleware.validateField('tags', 'not an array', { type: 'array' })
      expect(errors).toContain('tags must be of type array')
    })
  })
})
