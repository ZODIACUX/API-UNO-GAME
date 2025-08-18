class Container {
  constructor() {
    this.services = new Map()
    this.singletons = new Map()
  }

  register(name, factory, options = {}) {
    const { singleton = false, dependencies = [] } = options

    this.services.set(name, {
      factory,
      singleton,
      dependencies
    })

    return this
  }

  registerSingleton(name, factory, dependencies = []) {
    return this.register(name, factory, { singleton: true, dependencies })
  }

  registerTransient(name, factory, dependencies = []) {
    return this.register(name, factory, { singleton: false, dependencies })
  }

  resolve(name) {
    const service = this.services.get(name)

    if (!service) {
      throw new Error(`Service '${name}' not found`)
    }

    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name)
    }

    const dependencies = service.dependencies.map(dep => this.resolve(dep))
    const instance = service.factory(...dependencies)

    if (service.singleton) {
      this.singletons.set(name, instance)
    }

    return instance
  }

  has(name) {
    return this.services.has(name)
  }

  clear() {
    this.services.clear()
    this.singletons.clear()
  }

  getRegisteredServices() {
    return Array.from(this.services.keys())
  }
}

module.exports = Container
