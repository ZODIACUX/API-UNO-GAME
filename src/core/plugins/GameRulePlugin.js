const IPlugin = require('./IPlugin')
const Result = require('../errors/Result')

/**
 * Game Rule Plugin - Open/Closed Principle (OCP)
 * Base class for extending game rules without modifying core game logic
 */
class GameRulePlugin extends IPlugin {
  constructor(name, version = '1.0.0') {
    super()
    this.name = name
    this.version = version
    this.enabled = true
  }

  /**
   * Get plugin name
   * @returns {string} Plugin name
   */
  getName() {
    return this.name
  }

  /**
   * Get plugin version
   * @returns {string} Plugin version
   */
  getVersion() {
    return this.version
  }

  /**
   * Initialize plugin
   * @param {Object} config - Plugin configuration
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    this.config = config
    this.enabled = config.enabled !== false
  }

  /**
   * Check if plugin is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.enabled
  }

  /**
   * Validate a game move
   * @param {Object} gameState - Current game state
   * @param {Object} move - Move to validate
   * @param {Object} player - Player making the move
   * @returns {Promise<Result>} Result containing validation result
   */
  async validateMove(gameState, move, player) {
    return Result.fromAsync(async () => {
      // Default implementation - all moves are valid
      return {
        valid: true,
        message: 'Move is valid',
        gameState,
        move,
        player
      }
    })
  }

  /**
   * Process a game move and update game state
   * @param {Object} gameState - Current game state
   * @param {Object} move - Move to process
   * @param {Object} player - Player making the move
   * @returns {Promise<Result>} Result containing updated game state
   */
  async processMove(gameState, move, player) {
    return Result.fromAsync(async () => {
      // Default implementation - return unchanged game state
      return {
        gameState,
        effects: [],
        nextPlayer: this.getNextPlayer(gameState, player)
      }
    })
  }

  /**
   * Get next player in turn order
   * @param {Object} gameState - Current game state
   * @param {Object} currentPlayer - Current player
   * @returns {Object} Next player
   */
  getNextPlayer(gameState, currentPlayer) {
    const players = gameState.players || []
    const currentIndex = players.findIndex(p => p.id === currentPlayer.id)
    const direction = gameState.direction || 'clockwise'

    if (direction === 'clockwise') {
      return players[(currentIndex + 1) % players.length]
    } else {
      return players[(currentIndex - 1 + players.length) % players.length]
    }
  }

  /**
   * Check if a card can be played
   * @param {Object} card - Card to play
   * @param {Object} topCard - Top card on discard pile
   * @param {Object} gameState - Current game state
   * @returns {boolean} True if card can be played
   */
  canPlayCard(card, topCard, _gameState) {
    // Wild cards can always be played
    if (card.color === 'wild' || card.color === 'black') {
      return true
    }

    // Must match color or value
    return card.color === topCard.color || card.value === topCard.value
  }

  /**
   * Apply card effects to game state
   * @param {Object} gameState - Current game state
   * @param {Object} card - Card being played
   * @param {Object} player - Player playing the card
   * @returns {Promise<Result>} Result containing effects
   */
  async applyCardEffects(gameState, card, player) {
    return Result.fromAsync(async () => {
      const effects = []

      switch (card.value) {
      case 'skip':
        effects.push({
          type: 'skip_player',
          targetPlayer: this.getNextPlayer(gameState, player)
        })
        break

      case 'reverse':
        effects.push({
          type: 'reverse_direction',
          newDirection: gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise'
        })
        break

      case 'draw_two':
        effects.push({
          type: 'draw_cards',
          targetPlayer: this.getNextPlayer(gameState, player),
          cardCount: 2
        })
        break

      case 'wild_draw_four':
        effects.push({
          type: 'draw_cards',
          targetPlayer: this.getNextPlayer(gameState, player),
          cardCount: 4
        })
        break
      }

      return effects
    })
  }

  /**
   * Execute plugin functionality
   * @param {Object} input - Plugin input containing action and data
   * @returns {Promise<Result>} Plugin output
   */
  async execute(input) {
    const { action, gameState, move, player } = input

    switch (action) {
    case 'validateMove':
      return await this.validateMove(gameState, move, player)
    case 'processMove':
      return await this.processMove(gameState, move, player)
    case 'applyCardEffects':
      return await this.applyCardEffects(gameState, move.card, player)
    default:
      return Result.failure(new Error(`Unknown action: ${action}`))
    }
  }
}

module.exports = GameRulePlugin
