const Container = require('../../../../src/core/di/container')

describe('Container', () => {
  let container

  beforeEach(() => {
    container = new Container()
  })

  describe('register', () => {
    it('should register a service', () => {
      const factory = () => ({ name: 'test' })
      container.register('testService', factory)

      expect(container.has('testService')).toBe(true)
    })

    it('should register a singleton service', () => {
      const factory = () => ({ name: 'test' })
      container.registerSingleton('testService', factory)

      const instance1 = container.resolve('testService')
      const instance2 = container.resolve('testService')

      expect(instance1).toBe(instance2)
    })

    it('should register a transient service', () => {
      const factory = () => ({ name: 'test' })
      container.registerTransient('testService', factory)

      const instance1 = container.resolve('testService')
      const instance2 = container.resolve('testService')

      expect(instance1).not.toBe(instance2)
    })
  })

  describe('resolve', () => {
    it('should resolve a service without dependencies', () => {
      const factory = () => ({ name: 'test' })
      container.register('testService', factory)

      const instance = container.resolve('testService')

      expect(instance.name).toBe('test')
    })

    it('should resolve a service with dependencies', () => {
      const depFactory = () => ({ value: 'dependency' })
      const factory = (dep) => ({ name: 'test', dependency: dep })

      container.register('dependency', depFactory)
      container.register('testService', factory, { dependencies: ['dependency'] })

      const instance = container.resolve('testService')

      expect(instance.name).toBe('test')
      expect(instance.dependency.value).toBe('dependency')
    })

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.resolve('unknownService')
      }).toThrow('Service \'unknownService\' not found')
    })
  })

  describe('has', () => {
    it('should return true for registered service', () => {
      container.register('testService', () => ({}))
      expect(container.has('testService')).toBe(true)
    })

    it('should return false for unregistered service', () => {
      expect(container.has('unknownService')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all services', () => {
      container.register('testService1', () => ({}))
      container.register('testService2', () => ({}))

      container.clear()

      expect(container.has('testService1')).toBe(false)
      expect(container.has('testService2')).toBe(false)
    })
  })

  describe('getRegisteredServices', () => {
    it('should return list of registered service names', () => {
      container.register('service1', () => ({}))
      container.register('service2', () => ({}))

      const services = container.getRegisteredServices()

      expect(services).toContain('service1')
      expect(services).toContain('service2')
      expect(services.length).toBe(2)
    })
  })
})
