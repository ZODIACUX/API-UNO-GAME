const { Container } = require('../../../../src/core/di/container')

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
      const factory = () => ({ name: 'test', id: Math.random() })
      container.registerSingleton('testService', factory)

      const instance1 = container.resolve('testService')
      const instance2 = container.resolve('testService')

      expect(instance1).toBe(instance2)
      expect(instance1.id).toBe(instance2.id)
    })

    it('should register a transient service', () => {
      const factory = () => ({ name: 'test', id: Math.random() })
      container.register('testService', factory)

      const instance1 = container.resolve('testService')
      const instance2 = container.resolve('testService')

      expect(instance1).not.toBe(instance2)
      expect(instance1.id).not.toBe(instance2.id)
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
      container.register('testService', factory, ['dependency'])

      const instance = container.resolve('testService')

      expect(instance.name).toBe('test')
      expect(instance.dependency.value).toBe('dependency')
    })

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.resolve('unknownService')
      }).toThrow('Service \'unknownService\' not registered')
    })
  })

  describe('registerInstance', () => {
    it('should register an instance directly', () => {
      const instance = { name: 'direct instance' }
      container.registerInstance('testInstance', instance)

      const resolved = container.resolve('testInstance')
      expect(resolved).toBe(instance)
      expect(resolved.name).toBe('direct instance')
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

    it('should return true for registered instance', () => {
      container.registerInstance('testInstance', {})
      expect(container.has('testInstance')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all services', () => {
      container.register('testService1', () => ({}))
      container.register('testService2', () => ({}))
      container.registerInstance('testInstance', {})

      container.clear()

      expect(container.has('testService1')).toBe(false)
      expect(container.has('testService2')).toBe(false)
      expect(container.has('testInstance')).toBe(false)
    })
  })

  describe('getRegisteredServices', () => {
    it('should return list of registered service names', () => {
      container.register('service1', () => ({}))
      container.register('service2', () => ({}))
      container.registerInstance('instance1', {})

      const services = container.getRegisteredServices()

      expect(services).toContain('service1')
      expect(services).toContain('service2')
      expect(services).toContain('instance1')
      expect(services.length).toBe(3)
    })
  })

  describe('createChild', () => {
    it('should create a child container with parent registrations', () => {
      container.register('parentService', () => ({ type: 'parent' }))
      container.registerInstance('parentInstance', { type: 'parent instance' })

      const child = container.createChild()

      expect(child.has('parentService')).toBe(true)
      expect(child.has('parentInstance')).toBe(true)

      const parentServiceInstance = child.resolve('parentService')
      const parentInstanceInstance = child.resolve('parentInstance')

      expect(parentServiceInstance.type).toBe('parent')
      expect(parentInstanceInstance.type).toBe('parent instance')
    })
  })
})
