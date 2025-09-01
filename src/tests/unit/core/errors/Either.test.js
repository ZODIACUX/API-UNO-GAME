const Either = require('../../../../src/core/errors/Either')

describe('Either Monad', () => {
  describe('construction', () => {
    it('should create Either.left', () => {
      const either = Either.left('error')
      expect(either.isLeft()).toBe(true)
      expect(either.isRight()).toBe(false)
      expect(either.value).toBe('error')
    })

    it('should create Either.right', () => {
      const either = Either.right('success')
      expect(either.isLeft()).toBe(false)
      expect(either.isRight()).toBe(true)
      expect(either.value).toBe('success')
    })

    it('should create Either.of as right', () => {
      const either = Either.of('value')
      expect(either.isRight()).toBe(true)
      expect(either.value).toBe('value')
    })

    it('should create from nullable value', () => {
      const rightValue = Either.fromNullable('test')
      const leftValue = Either.fromNullable(null)
      const leftUndefined = Either.fromNullable(undefined)

      expect(rightValue.isRight()).toBe(true)
      expect(leftValue.isLeft()).toBe(true)
      expect(leftUndefined.isLeft()).toBe(true)
    })

    it('should create from nullable with custom left value', () => {
      const leftValue = Either.fromNullable(null, 'custom error')
      expect(leftValue.isLeft()).toBe(true)
      expect(leftValue.value).toBe('custom error')
    })
  })

  describe('tryCatch', () => {
    it('should return Right for successful function', () => {
      const either = Either.tryCatch(() => 42)
      expect(either.isRight()).toBe(true)
      expect(either.value).toBe(42)
    })

    it('should return Left for throwing function', () => {
      const either = Either.tryCatch(() => {
        throw new Error('test error')
      })
      expect(either.isLeft()).toBe(true)
      expect(either.value).toBe('test error')
    })

    it('should use custom error handler', () => {
      const either = Either.tryCatch(
        () => { throw new Error('test error') },
        (e) => `Custom: ${e.message}`
      )
      expect(either.isLeft()).toBe(true)
      expect(either.value).toBe('Custom: test error')
    })
  })

  describe('tryCatchAsync', () => {
    it('should return Right for successful async function', async () => {
      const either = await Either.tryCatchAsync(async () => 42)
      expect(either.isRight()).toBe(true)
      expect(either.value).toBe(42)
    })

    it('should return Left for throwing async function', async () => {
      const either = await Either.tryCatchAsync(async () => {
        throw new Error('async error')
      })
      expect(either.isLeft()).toBe(true)
      expect(either.value).toBe('async error')
    })

    it('should use custom error handler for async', async () => {
      const either = await Either.tryCatchAsync(
        async () => { throw new Error('async error') },
        (e) => `Async: ${e.message}`
      )
      expect(either.isLeft()).toBe(true)
      expect(either.value).toBe('Async: async error')
    })
  })

  describe('map', () => {
    it('should transform Right value', () => {
      const either = Either.right(5)
      const result = either.map(x => x * 2)

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should not transform Left value', () => {
      const either = Either.left('error')
      const result = either.map(x => x * 2)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('error')
    })
  })

  describe('mapLeft', () => {
    it('should transform Left value', () => {
      const either = Either.left('error')
      const result = either.mapLeft(x => `Error: ${x}`)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('Error: error')
    })

    it('should not transform Right value', () => {
      const either = Either.right('success')
      const result = either.mapLeft(x => `Error: ${x}`)

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe('success')
    })
  })

  describe('flatMap', () => {
    it('should chain Right operations', () => {
      const either = Either.right(5)
      const result = either.flatMap(x => Either.right(x * 2))

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should return Left when chaining with Left', () => {
      const either = Either.right(5)
      const result = either.flatMap(() => Either.left('error'))

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('error')
    })

    it('should not execute function when Left', () => {
      const either = Either.left('error')
      const mockFn = jest.fn()
      const result = either.flatMap(mockFn)

      expect(result.isLeft()).toBe(true)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('fold', () => {
    it('should call rightFn when Right', () => {
      const either = Either.right(42)
      const leftFn = jest.fn(() => 'left')
      const rightFn = jest.fn(x => `right: ${x}`)

      const result = either.fold(leftFn, rightFn)

      expect(result).toBe('right: 42')
      expect(rightFn).toHaveBeenCalledWith(42)
      expect(leftFn).not.toHaveBeenCalled()
    })

    it('should call leftFn when Left', () => {
      const either = Either.left('error')
      const leftFn = jest.fn(x => `left: ${x}`)
      const rightFn = jest.fn(() => 'right')

      const result = either.fold(leftFn, rightFn)

      expect(result).toBe('left: error')
      expect(leftFn).toHaveBeenCalledWith('error')
      expect(rightFn).not.toHaveBeenCalled()
    })
  })

  describe('getOrElse', () => {
    it('should return value when Right', () => {
      const either = Either.right('success')
      const result = either.getOrElse('default')

      expect(result).toBe('success')
    })

    it('should return default when Left', () => {
      const either = Either.left('error')
      const result = either.getOrElse('default')

      expect(result).toBe('default')
    })
  })

  describe('orElse', () => {
    it('should return self when Right', () => {
      const either = Either.right('success')
      const alternative = Either.right('alternative')
      const result = either.orElse(alternative)

      expect(result.value).toBe('success')
    })

    it('should return alternative when Left', () => {
      const either = Either.left('error')
      const alternative = Either.right('alternative')
      const result = either.orElse(alternative)

      expect(result.value).toBe('alternative')
    })
  })

  describe('filter', () => {
    it('should keep Right value when predicate is true', () => {
      const either = Either.right(10)
      const result = either.filter(x => x > 5)

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should return Left when predicate is false', () => {
      const either = Either.right(3)
      const result = either.filter(x => x > 5)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('Filter condition not met')
    })

    it('should use custom left value when predicate is false', () => {
      const either = Either.right(3)
      const result = either.filter(x => x > 5, 'Too small')

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('Too small')
    })

    it('should return Left unchanged when already Left', () => {
      const either = Either.left('error')
      const result = either.filter(x => x > 5)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('error')
    })
  })

  describe('tap', () => {
    it('should execute function when Right', () => {
      const either = Either.right(42)
      const mockFn = jest.fn()

      const result = either.tap(mockFn)

      expect(mockFn).toHaveBeenCalledWith(42)
      expect(result).toBe(either)
    })

    it('should not execute function when Left', () => {
      const either = Either.left('error')
      const mockFn = jest.fn()

      const result = either.tap(mockFn)

      expect(mockFn).not.toHaveBeenCalled()
      expect(result).toBe(either)
    })
  })

  describe('tapLeft', () => {
    it('should execute function when Left', () => {
      const either = Either.left('error')
      const mockFn = jest.fn()

      const result = either.tapLeft(mockFn)

      expect(mockFn).toHaveBeenCalledWith('error')
      expect(result).toBe(either)
    })

    it('should not execute function when Right', () => {
      const either = Either.right('success')
      const mockFn = jest.fn()

      const result = either.tapLeft(mockFn)

      expect(mockFn).not.toHaveBeenCalled()
      expect(result).toBe(either)
    })
  })

  describe('bimap', () => {
    it('should apply rightFn when Right', () => {
      const either = Either.right(5)
      const result = either.bimap(x => `Error: ${x}`, x => x * 2)

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should apply leftFn when Left', () => {
      const either = Either.left('error')
      const result = either.bimap(x => `Error: ${x}`, x => x * 2)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('Error: error')
    })
  })

  describe('swap', () => {
    it('should swap Right to Left', () => {
      const either = Either.right('success')
      const result = either.swap()

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('success')
    })

    it('should swap Left to Right', () => {
      const either = Either.left('error')
      const result = either.swap()

      expect(result.isRight()).toBe(true)
      expect(result.value).toBe('error')
    })
  })

  describe('compatibility with Result', () => {
    it('should have isSuccess property', () => {
      const rightEither = Either.right('success')
      const leftEither = Either.left('error')

      expect(rightEither.isSuccess).toBe(true)
      expect(leftEither.isSuccess).toBe(false)
    })

    it('should have error property', () => {
      const rightEither = Either.right('success')
      const leftEither = Either.left('error')

      expect(rightEither.error).toBe(null)
      expect(leftEither.error).toBe('error')
    })
  })

  describe('sequence', () => {
    it('should return Right with all values when all are Right', () => {
      const eithers = [
        Either.right(1),
        Either.right(2),
        Either.right(3)
      ]

      const result = Either.sequence(eithers)

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual([1, 2, 3])
    })

    it('should return first Left when any is Left', () => {
      const eithers = [
        Either.right(1),
        Either.left('error'),
        Either.right(3)
      ]

      const result = Either.sequence(eithers)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('error')
    })
  })

  describe('traverse', () => {
    it('should return Right with all results when all succeed', () => {
      const array = [1, 2, 3]
      const fn = x => Either.right(x * 2)

      const result = Either.traverse(array, fn)

      expect(result.isRight()).toBe(true)
      expect(result.value).toEqual([2, 4, 6])
    })

    it('should return first Left when any fails', () => {
      const array = [1, 2, 3]
      const fn = x => x === 2 ? Either.left('error') : Either.right(x * 2)

      const result = Either.traverse(array, fn)

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBe('error')
    })
  })

  describe('toString', () => {
    it('should return string representation for Right', () => {
      const either = Either.right(42)
      expect(either.toString()).toBe('Either.Right(42)')
    })

    it('should return string representation for Left', () => {
      const either = Either.left('error')
      expect(either.toString()).toBe('Either.Left(error)')
    })
  })
})
