class IPlugin {
  getName() {
    throw new Error('Method getName must be implemented')
  }

  getVersion() {
    throw new Error('Method getVersion must be implemented')
  }

  initialize() {
    throw new Error('Method initialize must be implemented')
  }

  execute(_context) {
    throw new Error('Method execute must be implemented')
  }

  shutdown() {
    throw new Error('Method shutdown must be implemented')
  }
}

module.exports = IPlugin
