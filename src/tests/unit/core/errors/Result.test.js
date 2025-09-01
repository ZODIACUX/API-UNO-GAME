const Result = require('../../../../src/core/errors/Result')

describe('Result', () => {
  describe('success', () => {
    it('should create a successful result', () => {
      const result = Result.success('test value')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe('test value')
      expect(result.error).toBeNull()
    })
  })

  describe('failure', () => {
    it('should create a failed result', () => {
      const error = new Error('test error')
      const result = Result.failure(error)

      expect(result.isSuccess).toBe(false)
      expect(result.value).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('from', () => {
    it('should create success result from function that succeeds', () => {
      const result = Result.from(() => 'success')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe('success')
    })

    it('should create failure result from function that throws', () => {
      const error = new Error('test error')
      const result = Result.from(() => {
        throw error
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })
  })

  describe('fromAsync', () => {
    it('should create success result from async function that succeeds', async () => {
      const result = await Result.fromAsync(async () => 'async success')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe('async success')
    })

    it('should create failure result from async function that throws', async () => {
      const error = new Error('async error')
      const result = await Result.fromAsync(async () => {
        throw error
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })
  })

  describe('map', () => {
    it('should transform success value', () => {
      const result = Result.success(5)
        .map(x => x * 2)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should not transform failure value', () => {
      const error = new Error('test error')
      const result = Result.failure(error)
        .map(x => x * 2)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })

    it('should handle transformation errors', () => {
      const result = Result.success(5)
        .map(() => {
          throw new Error('transform error')
        })

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('transform error')
    })
  })

  describe('flatMap', () => {
    it('should chain successful results', () => {
      const result = Result.success(5)
        .flatMap(x => Result.success(x * 2))

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should not chain on failure', () => {
      const error = new Error('test error')
      const result = Result.failure(error)
        .flatMap(x => Result.success(x * 2))

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe(error)
    })
  })

  describe('fold', () => {
    it('should call success function on success', () => {
      const result = Result.success('test')
      const folded = result.fold(
        value => `Success: ${value}`,
        error => `Error: ${error.message}`
      )

      expect(folded).toBe('Success: test')
    })

    it('should call failure function on failure', () => {
      const result = Result.failure(new Error('test error'))
      const folded = result.fold(
        value => `Success: ${value}`,
        error => `Error: ${error.message}`
      )

      expect(folded).toBe('Error: test error')
    })
  })

  describe('getOrElse', () => {
    it('should return value on success', () => {
      const result = Result.success('test')
      expect(result.getOrElse('default')).toBe('test')
    })

    it('should return default on failure', () => {
      const result = Result.failure(new Error('test error'))
      expect(result.getOrElse('default')).toBe('default')
    })
  })

  describe('getOrThrow', () => {
    it('should return value on success', () => {
      const result = Result.success('test')
      expect(result.getOrThrow()).toBe('test')
    })

    it('should throw error on failure', () => {
      const error = new Error('test error')
      const result = Result.failure(error)
      expect(() => result.getOrThrow()).toThrow(error)
    })
  })
})
