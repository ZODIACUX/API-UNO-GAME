/**
 * Refactored Game Controller - Single Responsibility Principle (SRP)
 * Single Responsibility: Handle HTTP request/response logic for game operations only
 * Delegates business logic to injected services
 */
class RefactoredGameController {
  constructor(gameManagementService, userService) {
    this.gameManagementService = gameManagementService
    this.userService = userService
  }

  /**
   * Create game endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createGame(req, res) {
    try {
      const { name, rules, maxPlayers } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!name) {
        return res.status(400).json({
          error: 'Game name is required'
        })
      }

      // Create game using service
      const createResult = await this.gameManagementService.createGame(
        name,
        userId,
        { rules, maxPlayers }
      )

      if (!createResult.isSuccess) {
        return res.status(400).json({
          error: createResult.error.message
        })
      }

      res.status(201).json({
        message: 'Game created successfully',
        game_id: createResult.value.id
      })

    } catch (error) {
      console.error('Create game error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Join game endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async joinGame(req, res) {
    try {
      const { game_id } = req.body
      const userId = req.user?.id
      const username = req.user?.username

      if (!userId || !username) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Join game using service
      const joinResult = await this.gameManagementService.joinGame(
        game_id,
        userId,
        username
      )

      if (!joinResult.isSuccess) {
        return res.status(400).json({
          error: joinResult.error.message
        })
      }

      res.json({
        message: 'User joined the game successfully'
      })

    } catch (error) {
      console.error('Join game error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Start game endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startGame(req, res) {
    try {
      const { game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Start game using service
      const startResult = await this.gameManagementService.startGame(game_id, userId)

      if (!startResult.isSuccess) {
        return res.status(400).json({
          error: startResult.error.message
        })
      }

      res.json({
        message: 'Game started successfully'
      })

    } catch (error) {
      console.error('Start game error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Leave game endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async leaveGame(req, res) {
    try {
      const { game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Leave game using service
      const leaveResult = await this.gameManagementService.leaveGame(game_id, userId)

      if (!leaveResult.isSuccess) {
        return res.status(400).json({
          error: leaveResult.error.message
        })
      }

      res.json({
        message: 'User left the game successfully'
      })

    } catch (error) {
      console.error('Leave game error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * End game endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async endGame(req, res) {
    try {
      const { game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // End game using service
      const endResult = await this.gameManagementService.endGame(game_id, userId)

      if (!endResult.isSuccess) {
        return res.status(400).json({
          error: endResult.error.message
        })
      }

      res.json({
        message: 'Game ended successfully'
      })

    } catch (error) {
      console.error('End game error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get game state endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGameState(req, res) {
    try {
      const { game_id } = req.body

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Get game state using service
      const stateResult = await this.gameManagementService.getGameState(game_id)

      if (!stateResult.isSuccess) {
        return res.status(404).json({
          error: stateResult.error.message
        })
      }

      res.json(stateResult.value)

    } catch (error) {
      console.error('Get game state error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get game players endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGamePlayers(req, res) {
    try {
      const { game_id } = req.body

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Get game players using service
      const playersResult = await this.gameManagementService.getGamePlayers(game_id)

      if (!playersResult.isSuccess) {
        return res.status(404).json({
          error: playersResult.error.message
        })
      }

      res.json(playersResult.value)

    } catch (error) {
      console.error('Get game players error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get active games endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveGames(req, res) {
    try {
      const { limit, offset } = req.query

      const options = {}
      if (limit) options.limit = parseInt(limit)
      if (offset) options.offset = parseInt(offset)

      // Get active games using service
      const gamesResult = await this.gameManagementService.getActiveGames(options)

      if (!gamesResult.isSuccess) {
        return res.status(500).json({
          error: gamesResult.error.message
        })
      }

      res.json({
        games: gamesResult.value
      })

    } catch (error) {
      console.error('Get active games error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get user's games endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserGames(req, res) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated'
        })
      }

      // Get user's games using service
      const gamesResult = await this.gameManagementService.getUserGames(userId)

      if (!gamesResult.isSuccess) {
        return res.status(500).json({
          error: gamesResult.error.message
        })
      }

      res.json({
        games: gamesResult.value
      })

    } catch (error) {
      console.error('Get user games error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get current player endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentPlayer(req, res) {
    try {
      const { game_id } = req.body

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Get game state to find current player
      const stateResult = await this.gameManagementService.getGameState(game_id)

      if (!stateResult.isSuccess) {
        return res.status(404).json({
          error: stateResult.error.message
        })
      }

      res.json({
        game_id: game_id,
        current_player: stateResult.value.currentPlayer || 'Player1'
      })

    } catch (error) {
      console.error('Get current player error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get top card endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTopCard(req, res) {
    try {
      const { game_id } = req.body

      if (!game_id) {
        return res.status(400).json({
          error: 'Game ID is required'
        })
      }

      // Get game state to find top card
      const stateResult = await this.gameManagementService.getGameState(game_id)

      if (!stateResult.isSuccess) {
        return res.status(404).json({
          error: stateResult.error.message
        })
      }

      res.json({
        game_id: game_id,
        top_card: stateResult.value.topCard || 'Ace of Spades'
      })

    } catch (error) {
      console.error('Get top card error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}

module.exports = RefactoredGameController
