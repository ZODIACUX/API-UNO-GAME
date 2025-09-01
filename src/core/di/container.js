/**
 * Dependency Injection Container
 * Implements Dependency Inversion Principle (DIP)
 * Manages service registration and resolution
 */
class Container {
  constructor() {
    this.services = new Map()
    this.singletons = new Map()
  }

  /**
   * Register a service with its factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create service instance
   * @param {Array} dependencies - Array of dependency names
   */
  register(name, factory, dependencies = []) {
    this.services.set(name, {
      factory,
      dependencies,
      isSingleton: false
    })
  }

  /**
   * Register a singleton service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create service instance
   * @param {Array} dependencies - Array of dependency names
   */
  registerSingleton(name, factory, dependencies = []) {
    this.services.set(name, {
      factory,
      dependencies,
      isSingleton: true
    })
  }

  /**
   * Register an instance directly
   * @param {string} name - Service name
   * @param {*} instance - Service instance
   */
  registerInstance(name, instance) {
    this.singletons.set(name, instance)
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    // Check if it's already a singleton instance
    if (this.singletons.has(name)) {
      return this.singletons.get(name)
    }

    // Get service registration
    const serviceRegistration = this.services.get(name)
    if (!serviceRegistration) {
      throw new Error(`Service '${name}' not registered`)
    }

    const { factory, dependencies, isSingleton } = serviceRegistration

    // Resolve dependencies
    const resolvedDependencies = dependencies.map(dep => this.resolve(dep))

    // Create instance
    const instance = factory(...resolvedDependencies)

    // Store singleton
    if (isSingleton) {
      this.singletons.set(name, instance)
    }

    return instance
  }

  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if registered
   */
  has(name) {
    return this.services.has(name) || this.singletons.has(name)
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.services.clear()
    this.singletons.clear()
  }

  /**
   * Get all registered service names
   * @returns {Array<string>} Array of service names
   */
  getRegisteredServices() {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.singletons.keys())
    ]
  }

  /**
   * Create a child container that inherits from this one
   * @returns {Container} Child container
   */
  createChild() {
    const child = new Container()
    // Copy parent registrations
    for (const [name, registration] of this.services) {
      child.services.set(name, registration)
    }
    for (const [name, instance] of this.singletons) {
      child.singletons.set(name, instance)
    }
    return child
  }
}

// Global container instance
const container = new Container()

module.exports = container
module.exports.Container = Container
