const IPlugin = require('./IPlugin')

class LoggingPlugin extends IPlugin {
  constructor() {
    super()
    this.isInitialized = false
  }

  getName() {
    return 'LoggingPlugin'
  }

  getVersion() {
    return '1.0.0'
  }

  initialize() {
    console.log('LoggingPlugin initialized')
    this.isInitialized = true
  }

  execute(context) {
    if (!this.isInitialized) {
      throw new Error('Plugin not initialized')
    }

    const { level = 'info', message, metadata = {} } = context

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    }

    switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry))
      break
    case 'warn':
      console.warn(JSON.stringify(logEntry))
      break
    case 'debug':
      console.debug(JSON.stringify(logEntry))
      break
    default:
      console.log(JSON.stringify(logEntry))
    }

    return logEntry
  }

  shutdown() {
    console.log('LoggingPlugin shutdown')
    this.isInitialized = false
  }
}

module.exports = LoggingPlugin
