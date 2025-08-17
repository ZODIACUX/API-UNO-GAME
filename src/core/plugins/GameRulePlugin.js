const IPlugin = require('./IPlugin')

/**
 * Base class for game rule plugins
 * Implements Open/Closed Principle - allows extending game rules without modifying core code
 */
class GameRulePlugin extends IPlugin {
  constructor(name, version = '1.0.0') {
    super()
    this.name = name
    this.version = version
    this.priority = 0
  }

  getName() {
    return this.name
  }

  getVersion() {
    return this.version
  }

  getPriority() {
    return this.priority
  }

  // Override in specific rule implementations
  validateMove(_gameState, _move, _player) {
    return { valid: true, message: 'Move is valid' }
  }

  processMove(_gameState, _move, _player) {
    return _gameState
  }

  calculateScore(_gameState, _player) {
    return 0
  }

  onGameStart(_gameState) {
    return _gameState
  }

  onGameEnd(_gameState) {
    return _gameState
  }

  onPlayerJoin(_gameState, _player) {
    return _gameState
  }

  onPlayerLeave(_gameState, _player) {
    return _gameState
  }

  initialize() {
    console.log(`Game rule plugin ${this.name} v${this.version} initialized`)
  }

  shutdown() {
    console.log(`Game rule plugin ${this.name} v${this.version} shutdown`)
  }

  execute(context) {
    const { action, gameState, move, player } = context

    switch (action) {
    case 'validateMove':
      return this.validateMove(gameState, move, player)
    case 'processMove':
      return this.processMove(gameState, move, player)
    case 'calculateScore':
      return this.calculateScore(gameState, player)
    case 'onGameStart':
      return this.onGameStart(gameState)
    case 'onGameEnd':
      return this.onGameEnd(gameState)
    case 'onPlayerJoin':
      return this.onPlayerJoin(gameState, player)
    case 'onPlayerLeave':
      return this.onPlayerLeave(gameState, player)
    default:
      return gameState
    }
  }
}

module.exports = GameRulePlugin
