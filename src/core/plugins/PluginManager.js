const Result = require('../errors/Result')

class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.hooks = new Map()
  }

  registerPlugin(plugin) {
    return Result.from(() => {
      if (!plugin || typeof plugin.getName !== 'function') {
        throw new Error('Invalid plugin: must implement getName method')
      }

      const name = plugin.getName()
      if (this.plugins.has(name)) {
        throw new Error(`Plugin ${name} is already registered`)
      }

      this.plugins.set(name, plugin)
      plugin.initialize()

      return plugin
    })
  }

  unregisterPlugin(name) {
    return Result.from(() => {
      if (!this.plugins.has(name)) {
        throw new Error(`Plugin ${name} is not registered`)
      }

      const plugin = this.plugins.get(name)
      plugin.shutdown()
      this.plugins.delete(name)

      return true
    })
  }

  executePlugin(name, context = {}) {
    return Result.from(() => {
      if (!this.plugins.has(name)) {
        throw new Error(`Plugin ${name} is not registered`)
      }

      const plugin = this.plugins.get(name)
      return plugin.execute(context)
    })
  }

  registerHook(eventName, callback) {
    if (!this.hooks.has(eventName)) {
      this.hooks.set(eventName, [])
    }
    this.hooks.get(eventName).push(callback)
  }

  executeHook(eventName, data) {
    return Result.fromAsync(async () => {
      if (!this.hooks.has(eventName)) {
        return data
      }

      const hooks = this.hooks.get(eventName)
      let result = data

      for (const hook of hooks) {
        result = await hook(result)
      }

      return result
    })
  }

  getRegisteredPlugins() {
    return Array.from(this.plugins.keys())
  }

  getPlugin(name) {
    return this.plugins.get(name)
  }
}

module.exports = PluginManager
