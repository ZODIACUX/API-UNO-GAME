const Container = require('./container')

class ServiceLocator {
  constructor() {
    this.container = new Container()
  }

  static getInstance() {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator()
    }
    return ServiceLocator.instance
  }

  register(name, factory, options) {
    return this.container.register(name, factory, options)
  }

  registerSingleton(name, factory, dependencies) {
    return this.container.registerSingleton(name, factory, dependencies)
  }

  registerTransient(name, factory, dependencies) {
    return this.container.registerTransient(name, factory, dependencies)
  }

  resolve(name) {
    return this.container.resolve(name)
  }

  has(name) {
    return this.container.has(name)
  }

  clear() {
    this.container.clear()
  }

  getRegisteredServices() {
    return this.container.getRegisteredServices()
  }
}

module.exports = ServiceLocator
