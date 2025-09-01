/**
 * Base Plugin Interface - Open/Closed Principle (OCP)
 * Allows extending functionality without modifying existing code
 */
class IPlugin {
  /**
   * Get plugin name
   * @returns {string} Plugin name
   */
  getName() {
    throw new Error('Method getName must be implemented')
  }

  /**
   * Get plugin version
   * @returns {string} Plugin version
   */
  getVersion() {
    throw new Error('Method getVersion must be implemented')
  }

  /**
   * Initialize plugin
   * @param {Object} config - Plugin configuration
   * @returns {Promise<void>}
   */
  async initialize(_config = {}) {
    throw new Error('Method initialize must be implemented')
  }

  /**
   * Execute plugin functionality
   * @param {*} input - Plugin input
   * @returns {Promise<*>} Plugin output
   */
  async execute(_input) {
    throw new Error('Method execute must be implemented')
  }

  /**
   * Check if plugin is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return true
  }

  /**
   * Cleanup plugin resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Default implementation - no cleanup needed
  }
}

module.exports = IPlugin
