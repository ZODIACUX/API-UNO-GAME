// Simple working test to verify Jest is functioning
describe('Basic Jest Functionality', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })

  it('should handle objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr).toHaveLength(5)
    expect(arr).toContain(3)
    expect(arr[0]).toBe(1)
  })

  it('should handle error cases', () => {
    expect(() => {
      throw new Error('Test error')
    }).toThrow('Test error')
  })
})

// Test Result monad directly from file
describe('Result Monad Direct Test', () => {
  // Import directly without relative paths
  const Result = require('../../core/errors/Result')

  it('should create success result', () => {
    const result = Result.success('test value')
    expect(result.isSuccess).toBe(true)
    expect(result.value).toBe('test value')
    expect(result.error).toBeNull()
  })

  it('should create failure result', () => {
    const error = new Error('test error')
    const result = Result.failure(error)
    expect(result.isSuccess).toBe(false)
    expect(result.value).toBeNull()
    expect(result.error).toBe(error)
  })

  it('should handle map operations', () => {
    const result = Result.success(5)
      .map(x => x * 2)
    expect(result.isSuccess).toBe(true)
    expect(result.value).toBe(10)
  })

  it('should handle flatMap operations', () => {
    const result = Result.success(5)
      .flatMap(x => Result.success(x * 2))
    expect(result.isSuccess).toBe(true)
    expect(result.value).toBe(10)
  })

  it('should handle fold operations', () => {
    const successResult = Result.success('test')
    const failureResult = Result.failure(new Error('error'))

    const successFold = successResult.fold(
      value => `Success: ${value}`,
      error => `Error: ${error.message}`
    )

    const failureFold = failureResult.fold(
      value => `Success: ${value}`,
      error => `Error: ${error.message}`
    )

    expect(successFold).toBe('Success: test')
    expect(failureFold).toBe('Error: error')
  })
})

// Test Maybe monad directly
describe('Maybe Monad Direct Test', () => {
  const Maybe = require('../../core/errors/Maybe')

  it('should create Some value', () => {
    const maybe = Maybe.some('test')
    expect(maybe.isSome()).toBe(true)
    expect(maybe.isNone()).toBe(false)
    expect(maybe.value).toBe('test')
  })

  it('should create None value', () => {
    const maybe = Maybe.none()
    expect(maybe.isNone()).toBe(true)
    expect(maybe.isSome()).toBe(false)
  })

  it('should handle fromNullable', () => {
    const someValue = Maybe.fromNullable('test')
    const noneValue = Maybe.fromNullable(null)

    expect(someValue.isSome()).toBe(true)
    expect(noneValue.isNone()).toBe(true)
  })

  it('should handle map operations', () => {
    const maybe = Maybe.some(5)
      .map(x => x * 2)
    expect(maybe.isSome()).toBe(true)
    expect(maybe.value).toBe(10)
  })

  it('should handle getOrElse', () => {
    const someValue = Maybe.some('test').getOrElse('default')
    const noneValue = Maybe.none().getOrElse('default')

    expect(someValue).toBe('test')
    expect(noneValue).toBe('default')
  })
})

// Test Either monad directly
describe('Either Monad Direct Test', () => {
  const Either = require('../../core/errors/Either')

  it('should create Right value', () => {
    const either = Either.right('success')
    expect(either.isRight).toBe(true)
    expect(either.isLeft).toBe(false)
    expect(either.value).toBe('success')
  })

  it('should create Left value', () => {
    const either = Either.left('error')
    expect(either.isLeft).toBe(true)
    expect(either.isRight).toBe(false)
    expect(either.value).toBe('error')
  })

  it('should handle map operations', () => {
    const rightEither = Either.right(5).map(x => x * 2)
    const leftEither = Either.left('error').map(x => x * 2)

    expect(rightEither.isRight).toBe(true)
    expect(rightEither.value).toBe(10)
    expect(leftEither.isLeft).toBe(true)
    expect(leftEither.value).toBe('error')
  })

  it('should handle fold operations', () => {
    const rightResult = Either.right('success').fold(
      left => `Error: ${left}`,
      right => `Success: ${right}`
    )

    const leftResult = Either.left('error').fold(
      left => `Error: ${left}`,
      right => `Success: ${right}`
    )

    expect(rightResult).toBe('Success: success')
    expect(leftResult).toBe('Error: error')
  })
})

// Test Container directly
describe('Container Direct Test', () => {
  const { Container } = require('../../core/di/container')

  let container

  beforeEach(() => {
    container = new Container()
  })

  it('should register and resolve services', () => {
    const factory = () => ({ name: 'test service' })
    container.register('testService', factory)

    const service = container.resolve('testService')
    expect(service.name).toBe('test service')
  })

  it('should handle singletons', () => {
    const factory = () => ({ id: Math.random() })
    container.registerSingleton('singletonService', factory)

    const instance1 = container.resolve('singletonService')
    const instance2 = container.resolve('singletonService')

    expect(instance1).toBe(instance2)
    expect(instance1.id).toBe(instance2.id)
  })

  it('should resolve dependencies', () => {
    const depFactory = () => ({ type: 'dependency' })
    const serviceFactory = (dep) => ({ name: 'service', dependency: dep })

    container.register('dependency', depFactory)
    container.register('service', serviceFactory, ['dependency'])

    const service = container.resolve('service')
    expect(service.name).toBe('service')
    expect(service.dependency.type).toBe('dependency')
  })

  it('should check service registration', () => {
    container.register('testService', () => ({}))
    expect(container.has('testService')).toBe(true)
    expect(container.has('nonExistentService')).toBe(false)
  })

  it('should clear all services', () => {
    container.register('service1', () => ({}))
    container.register('service2', () => ({}))

    expect(container.has('service1')).toBe(true)
    expect(container.has('service2')).toBe(true)

    container.clear()

    expect(container.has('service1')).toBe(false)
    expect(container.has('service2')).toBe(false)
  })
})
