const Maybe = require('../../../../src/core/errors/Maybe')

describe('Maybe Monad', () => {
  describe('construction', () => {
    it('should create Maybe with value', () => {
      const maybe = Maybe.of(42)
      expect(maybe.value).toBe(42)
      expect(maybe.isSome()).toBe(true)
      expect(maybe.isNone()).toBe(false)
    })

    it('should create Maybe.none', () => {
      const maybe = Maybe.none()
      expect(maybe.value).toBe(null)
      expect(maybe.isNone()).toBe(true)
      expect(maybe.isSome()).toBe(false)
    })

    it('should create Maybe.some', () => {
      const maybe = Maybe.some('test')
      expect(maybe.value).toBe('test')
      expect(maybe.isSome()).toBe(true)
    })

    it('should create from nullable value', () => {
      const someValue = Maybe.fromNullable('test')
      const noneValue = Maybe.fromNullable(null)
      const undefinedValue = Maybe.fromNullable(undefined)

      expect(someValue.isSome()).toBe(true)
      expect(noneValue.isNone()).toBe(true)
      expect(undefinedValue.isNone()).toBe(true)
    })
  })

  describe('map', () => {
    it('should transform value when Some', () => {
      const maybe = Maybe.of(5)
      const result = maybe.map(x => x * 2)

      expect(result.isSome()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should not transform when None', () => {
      const maybe = Maybe.none()
      const result = maybe.map(x => x * 2)

      expect(result.isNone()).toBe(true)
    })
  })

  describe('flatMap', () => {
    it('should chain Maybe operations when Some', () => {
      const maybe = Maybe.of(5)
      const result = maybe.flatMap(x => Maybe.of(x * 2))

      expect(result.isSome()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should return None when chaining with None', () => {
      const maybe = Maybe.of(5)
      const result = maybe.flatMap(() => Maybe.none())

      expect(result.isNone()).toBe(true)
    })

    it('should not execute function when None', () => {
      const maybe = Maybe.none()
      const mockFn = jest.fn()
      const result = maybe.flatMap(mockFn)

      expect(result.isNone()).toBe(true)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('filter', () => {
    it('should keep value when predicate is true', () => {
      const maybe = Maybe.of(10)
      const result = maybe.filter(x => x > 5)

      expect(result.isSome()).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should return None when predicate is false', () => {
      const maybe = Maybe.of(3)
      const result = maybe.filter(x => x > 5)

      expect(result.isNone()).toBe(true)
    })

    it('should return None when already None', () => {
      const maybe = Maybe.none()
      const result = maybe.filter(x => x > 5)

      expect(result.isNone()).toBe(true)
    })
  })

  describe('getOrElse', () => {
    it('should return value when Some', () => {
      const maybe = Maybe.of('test')
      const result = maybe.getOrElse('default')

      expect(result).toBe('test')
    })

    it('should return default when None', () => {
      const maybe = Maybe.none()
      const result = maybe.getOrElse('default')

      expect(result).toBe('default')
    })
  })

  describe('orElse', () => {
    it('should return self when Some', () => {
      const maybe = Maybe.of('test')
      const alternative = Maybe.of('alternative')
      const result = maybe.orElse(alternative)

      expect(result.value).toBe('test')
    })

    it('should return alternative when None', () => {
      const maybe = Maybe.none()
      const alternative = Maybe.of('alternative')
      const result = maybe.orElse(alternative)

      expect(result.value).toBe('alternative')
    })
  })

  describe('fold', () => {
    it('should call onSome when Some', () => {
      const maybe = Maybe.of(42)
      const onNone = jest.fn(() => 'none')
      const onSome = jest.fn(x => `some: ${x}`)

      const result = maybe.fold(onNone, onSome)

      expect(result).toBe('some: 42')
      expect(onSome).toHaveBeenCalledWith(42)
      expect(onNone).not.toHaveBeenCalled()
    })

    it('should call onNone when None', () => {
      const maybe = Maybe.none()
      const onNone = jest.fn(() => 'none')
      const onSome = jest.fn(x => `some: ${x}`)

      const result = maybe.fold(onNone, onSome)

      expect(result).toBe('none')
      expect(onNone).toHaveBeenCalled()
      expect(onSome).not.toHaveBeenCalled()
    })
  })

  describe('tap', () => {
    it('should execute function when Some', () => {
      const maybe = Maybe.of(42)
      const mockFn = jest.fn()

      const result = maybe.tap(mockFn)

      expect(mockFn).toHaveBeenCalledWith(42)
      expect(result).toBe(maybe)
    })

    it('should not execute function when None', () => {
      const maybe = Maybe.none()
      const mockFn = jest.fn()

      const result = maybe.tap(mockFn)

      expect(mockFn).not.toHaveBeenCalled()
      expect(result).toBe(maybe)
    })
  })

  describe('toString', () => {
    it('should return string representation for Some', () => {
      const maybe = Maybe.of(42)
      expect(maybe.toString()).toBe('Maybe.Some(42)')
    })

    it('should return string representation for None', () => {
      const maybe = Maybe.none()
      expect(maybe.toString()).toBe('Maybe.None')
    })
  })
})
