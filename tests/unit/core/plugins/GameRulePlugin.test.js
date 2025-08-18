const GameRulePlugin = require('../../../../src/core/plugins/GameRulePlugin')

describe('GameRulePlugin', () => {
  let plugin

  beforeEach(() => {
    plugin = new GameRulePlugin('TestPlugin', '1.0.0')
  })

  describe('constructor', () => {
    it('should initialize with name and version', () => {
      expect(plugin.name).toBe('TestPlugin')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.priority).toBe(0)
    })

    it('should use default version when not provided', () => {
      const defaultPlugin = new GameRulePlugin('DefaultPlugin')
      expect(defaultPlugin.version).toBe('1.0.0')
    })
  })

  describe('getName', () => {
    it('should return plugin name', () => {
      expect(plugin.getName()).toBe('TestPlugin')
    })
  })

  describe('getVersion', () => {
    it('should return plugin version', () => {
      expect(plugin.getVersion()).toBe('1.0.0')
    })
  })

  describe('getPriority', () => {
    it('should return plugin priority', () => {
      expect(plugin.getPriority()).toBe(0)
    })

    it('should allow setting custom priority', () => {
      plugin.priority = 100
      expect(plugin.getPriority()).toBe(100)
    })
  })

  describe('validateMove', () => {
    it('should return valid move by default', () => {
      const gameState = { currentPlayer: 'player1' }
      const move = { card: 'Red 7' }
      const player = { username: 'player1' }

      const result = plugin.validateMove(gameState, move, player)

      expect(result.valid).toBe(true)
      expect(result.message).toBe('Move is valid')
    })
  })

  describe('processMove', () => {
    it('should return unchanged game state by default', () => {
      const gameState = { currentPlayer: 'player1', deck: [] }
      const move = { card: 'Red 7' }
      const player = { username: 'player1' }

      const result = plugin.processMove(gameState, move, player)

      expect(result).toBe(gameState)
    })
  })

  describe('calculateScore', () => {
    it('should return 0 by default', () => {
      const gameState = { players: {} }
      const player = { username: 'player1' }

      const result = plugin.calculateScore(gameState, player)

      expect(result).toBe(0)
    })
  })

  describe('onGameStart', () => {
    it('should return unchanged game state by default', () => {
      const gameState = { status: 'waiting' }

      const result = plugin.onGameStart(gameState)

      expect(result).toBe(gameState)
    })
  })

  describe('onGameEnd', () => {
    it('should return unchanged game state by default', () => {
      const gameState = { status: 'finished' }

      const result = plugin.onGameEnd(gameState)

      expect(result).toBe(gameState)
    })
  })

  describe('onPlayerJoin', () => {
    it('should return unchanged game state by default', () => {
      const gameState = { players: {} }
      const player = { username: 'player1' }

      const result = plugin.onPlayerJoin(gameState, player)

      expect(result).toBe(gameState)
    })
  })

  describe('onPlayerLeave', () => {
    it('should return unchanged game state by default', () => {
      const gameState = { players: { player1: {} } }
      const player = { username: 'player1' }

      const result = plugin.onPlayerLeave(gameState, player)

      expect(result).toBe(gameState)
    })
  })

  describe('initialize', () => {
    it('should log initialization message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      plugin.initialize()

      expect(consoleSpy).toHaveBeenCalledWith('Game rule plugin TestPlugin v1.0.0 initialized')
      consoleSpy.mockRestore()
    })
  })

  describe('shutdown', () => {
    it('should log shutdown message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      plugin.shutdown()

      expect(consoleSpy).toHaveBeenCalledWith('Game rule plugin TestPlugin v1.0.0 shutdown')
      consoleSpy.mockRestore()
    })
  })

  describe('execute', () => {
    it('should handle validateMove action', () => {
      const context = {
        action: 'validateMove',
        gameState: { currentPlayer: 'player1' },
        move: { card: 'Red 7' },
        player: { username: 'player1' }
      }

      const result = plugin.execute(context)

      expect(result.valid).toBe(true)
      expect(result.message).toBe('Move is valid')
    })

    it('should handle processMove action', () => {
      const gameState = { currentPlayer: 'player1' }
      const context = {
        action: 'processMove',
        gameState,
        move: { card: 'Red 7' },
        player: { username: 'player1' }
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })

    it('should handle calculateScore action', () => {
      const context = {
        action: 'calculateScore',
        gameState: { players: {} },
        player: { username: 'player1' }
      }

      const result = plugin.execute(context)

      expect(result).toBe(0)
    })

    it('should handle onGameStart action', () => {
      const gameState = { status: 'waiting' }
      const context = {
        action: 'onGameStart',
        gameState
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })

    it('should handle onGameEnd action', () => {
      const gameState = { status: 'finished' }
      const context = {
        action: 'onGameEnd',
        gameState
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })

    it('should handle onPlayerJoin action', () => {
      const gameState = { players: {} }
      const context = {
        action: 'onPlayerJoin',
        gameState,
        player: { username: 'player1' }
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })

    it('should handle onPlayerLeave action', () => {
      const gameState = { players: { player1: {} } }
      const context = {
        action: 'onPlayerLeave',
        gameState,
        player: { username: 'player1' }
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })

    it('should return gameState for unknown action', () => {
      const gameState = { status: 'waiting' }
      const context = {
        action: 'unknownAction',
        gameState
      }

      const result = plugin.execute(context)

      expect(result).toBe(gameState)
    })
  })
})
