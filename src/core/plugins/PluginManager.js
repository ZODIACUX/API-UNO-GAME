const Result = require('../errors/Result')

/**
 * Plugin Manager - Open/Closed Principle (OCP)
 * Manages plugin registration, loading, and execution
 */
class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.enabledPlugins = new Map()
  }

  /**
   * Register a plugin
   * @param {string} name - Plugin name
   * @param {IPlugin} plugin - Plugin instance
   * @returns {Result} Registration result
   */
  register(name, plugin) {
    return Result.from(() => {
      if (this.plugins.has(name)) {
        throw new Error(`Plugin '${name}' is already registered`)
      }

      this.plugins.set(name, plugin)

      if (plugin.isEnabled()) {
        this.enabledPlugins.set(name, plugin)
      }

      return { name, plugin, registered: true }
    })
  }

  /**
   * Unregister a plugin
   * @param {string} name - Plugin name
   * @returns {Result} Unregistration result
   */
  unregister(name) {
    return Result.from(() => {
      if (!this.plugins.has(name)) {
        throw new Error(`Plugin '${name}' is not registered`)
      }

      this.plugins.delete(name)
      this.enabledPlugins.delete(name)

      return { name, unregistered: true }
    })
  }

  /**
   * Initialize all registered plugins
   * @param {Object} config - Global plugin configuration
   * @returns {Promise<Result>} Initialization result
   */
  async initializeAll(config = {}) {
    return Result.fromAsync(async () => {
      const results = []

      for (const [name, plugin] of this.plugins) {
        try {
          const pluginConfig = config[name] || {}
          await plugin.initialize(pluginConfig)

          // Update enabled status after initialization
          if (plugin.isEnabled()) {
            this.enabledPlugins.set(name, plugin)
          } else {
            this.enabledPlugins.delete(name)
          }

          results.push({ name, initialized: true })
        } catch (error) {
          results.push({ name, initialized: false, error: error.message })
        }
      }

      return results
    })
  }

  /**
   * Execute a plugin by name
   * @param {string} name - Plugin name
   * @param {*} input - Plugin input
   * @returns {Promise<Result>} Plugin execution result
   */
  async execute(name, input) {
    return Result.fromAsync(async () => {
      const plugin = this.enabledPlugins.get(name)
      if (!plugin) {
        throw new Error(`Plugin '${name}' is not registered or not enabled`)
      }

      return await plugin.execute(input)
    })
  }

  /**
   * Execute all enabled plugins of a specific type
   * @param {string} pluginType - Plugin type filter
   * @param {*} input - Plugin input
   * @returns {Promise<Result>} Array of plugin execution results
   */
  async executeAll(pluginType, input) {
    return Result.fromAsync(async () => {
      const results = []

      for (const [name, plugin] of this.enabledPlugins) {
        // Skip plugins that don't match the type filter
        if (pluginType && !plugin.constructor.name.toLowerCase().includes(pluginType.toLowerCase())) {
          continue
        }

        try {
          const result = await plugin.execute(input)
          results.push({ name, result, success: true })
        } catch (error) {
          results.push({ name, error: error.message, success: false })
        }
      }

      return results
    })
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {IPlugin|null} Plugin instance or null
   */
  getPlugin(name) {
    return this.plugins.get(name) || null
  }

  /**
   * Get all registered plugins
   * @returns {Array} Array of plugin names and instances
   */
  getAllPlugins() {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      plugin,
      enabled: plugin.isEnabled(),
      version: plugin.getVersion()
    }))
  }

  /**
   * Get all enabled plugins
   * @returns {Array} Array of enabled plugin names and instances
   */
  getEnabledPlugins() {
    return Array.from(this.enabledPlugins.entries()).map(([name, plugin]) => ({
      name,
      plugin,
      version: plugin.getVersion()
    }))
  }

  /**
   * Enable a plugin
   * @param {string} name - Plugin name
   * @returns {Result} Enable result
   */
  enable(name) {
    return Result.from(() => {
      const plugin = this.plugins.get(name)
      if (!plugin) {
        throw new Error(`Plugin '${name}' is not registered`)
      }

      plugin.enabled = true
      this.enabledPlugins.set(name, plugin)

      return { name, enabled: true }
    })
  }

  /**
   * Disable a plugin
   * @param {string} name - Plugin name
   * @returns {Result} Disable result
   */
  disable(name) {
    return Result.from(() => {
      const plugin = this.plugins.get(name)
      if (!plugin) {
        throw new Error(`Plugin '${name}' is not registered`)
      }

      plugin.enabled = false
      this.enabledPlugins.delete(name)

      return { name, enabled: false }
    })
  }

  /**
   * Cleanup all plugins
   * @returns {Promise<Result>} Cleanup result
   */
  async cleanup() {
    return Result.fromAsync(async () => {
      const results = []

      for (const [name, plugin] of this.plugins) {
        try {
          await plugin.cleanup()
          results.push({ name, cleaned: true })
        } catch (error) {
          results.push({ name, cleaned: false, error: error.message })
        }
      }

      this.plugins.clear()
      this.enabledPlugins.clear()

      return results
    })
  }
}

// Global plugin manager instance
const pluginManager = new PluginManager()

module.exports = pluginManager
module.exports.PluginManager = PluginManager
