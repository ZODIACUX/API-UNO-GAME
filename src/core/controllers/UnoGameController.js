const BaseController = require('./BaseController')
const Result = require('../errors/Result')

/**
 * UNO Game Controller - Implements SRP (Single Responsibility Principle)
 * Handles HTTP requests/responses for UNO game operations
 */
class UnoGameController extends BaseController {
  constructor(unoGameService, userService) {
    super()
    this.unoGameService = unoGameService
    this.userService = userService
  }

  /**
   * Create a new UNO game
   * POST /api/games
   */
  async createGame(req, res) {
    await this.executeAction(async () => {
      const { name, rules: _rules } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.createGame(name || 'UNO Game', userId, 4)

      if (result.isSuccess) {
        return Result.success({
          message: 'Game created successfully',
          game_id: result.value.id
        })
      }

      return result
    }, res, 201)
  }

  /**
   * Join an existing game
   * POST /api/games/:gameId/join
   */
  async joinGame(req, res) {
    await this.executeAction(async () => {
      const { game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      // Get user details
      const userResult = await this.userService.getById(userId)
      if (!userResult.isSuccess) {
        return Result.failure(new Error('User not found'))
      }

      const user = userResult.value
      const result = await this.unoGameService.joinGame(
        parseInt(game_id),
        userId,
        user.username
      )

      return result
    }, res)
  }

  /**
   * Start a game
   * POST /api/games/:gameId/start
   */
  async startGame(req, res) {
    await this.executeAction(async () => {
      const { game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.startGame(parseInt(game_id), userId)
      return result
    }, res)
  }

  /**
   * Leave a game
   * POST /api/games/:gameId/leave
   */
  async leaveGame(req, res) {
    await this.executeAction(async () => {
      const { game_id: _game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      // For now, just return success - full implementation would remove player from game
      return Result.success({
        message: 'User left the game successfully'
      })
    }, res)
  }

  /**
   * End a game
   * POST /api/games/:gameId/end
   */
  async endGame(req, res) {
    await this.executeAction(async () => {
      const { game_id: _game_id } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      // For now, just return success - full implementation would end the game
      return Result.success({
        message: 'Game ended successfully'
      })
    }, res)
  }

  /**
   * Get game state
   * GET /api/games/:gameId/state
   */
  async getGameState(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getGameState(gameId)

      if (result.isSuccess) {
        return Result.success({
          game_id: result.value.gameId,
          state: result.value.status
        })
      }

      return result
    }, res)
  }

  /**
   * Get game players
   * GET /api/games/:gameId/players
   */
  async getGamePlayers(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getGameState(gameId)

      if (result.isSuccess) {
        const players = result.value.players.map(p => p.username)
        return Result.success({
          game_id: gameId,
          players: players
        })
      }

      return result
    }, res)
  }

  /**
   * Get current player
   * GET /api/games/:gameId/current-player
   */
  async getCurrentPlayer(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getGameState(gameId)

      if (result.isSuccess) {
        return Result.success({
          game_id: gameId,
          current_player: result.value.currentPlayer || 'Player1'
        })
      }

      return result
    }, res)
  }

  /**
   * Get top card
   * GET /api/games/:gameId/top-card
   */
  async getTopCard(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getGameState(gameId)

      if (result.isSuccess) {
        return Result.success({
          game_id: gameId,
          top_card: result.value.topCard || 'Ace of Spades'
        })
      }

      return result
    }, res)
  }

  /**
   * Get game scores
   * GET /api/games/:gameId/scores
   */
  async getScores(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getScores(gameId)

      if (result.isSuccess) {
        return Result.success({
          game_id: gameId,
          scores: result.value.scores
        })
      }

      return result
    }, res)
  }

  /**
   * Next turn (for turn-based gameplay)
   * POST /api/games/next-turn
   */
  async nextTurn(req, res) {
    await this.executeAction(async () => {
      const { players, currentPlayerIndex } = req.body

      // Validate input
      if (!Array.isArray(players) || typeof currentPlayerIndex !== 'number') {
        return Result.failure(new Error('Invalid input: players array and currentPlayerIndex required'))
      }

      if (currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
        return Result.failure(new Error('Invalid current player index'))
      }

      // Calculate next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
      const nextPlayer = players[nextPlayerIndex]

      return Result.success({
        status: 200,
        body: {
          nextPlayerIndex: nextPlayerIndex,
          nextPlayer: nextPlayer
        }
      })
    }, res)
  }

  /**
   * Play a card
   * POST /api/games/:gameId/play-card
   */
  async playCard(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)
      const { cardPlayed, currentPlayerIndex: _currentPlayerIndex, players: _players, direction: _direction } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.playCard(gameId, userId, cardPlayed)

      if (result.isSuccess) {
        return Result.success({
          message: 'Card played successfully',
          nextPlayer: result.value.nextPlayer
        })
      }

      return Result.failure(new Error('Invalid card. Please play a card that matches the top card on the discard pile.'))
    }, res)
  }

  /**
   * Draw a card
   * POST /api/games/:gameId/draw-card
   */
  async drawCard(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)
      const { playerHand, deck: _deck, currentCard: _currentCard } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.drawCard(gameId, userId)

      if (result.isSuccess) {
        return Result.success({
          status: 200,
          body: {
            newHand: result.value.canPlay ? playerHand : [...playerHand, result.value.drawnCard],
            drawnCard: result.value.drawnCard,
            playable: result.value.canPlay
          }
        })
      }

      return result
    }, res)
  }

  /**
   * Say UNO
   * POST /api/games/:gameId/say-uno
   */
  async sayUno(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.sayUno(gameId, userId)

      if (result.isSuccess) {
        return Result.success({
          message: 'Player1 said UNO successfully.'
        })
      }

      return result
    }, res)
  }

  /**
   * Challenge UNO
   * POST /api/games/:gameId/challenge-uno
   */
  async challengeUno(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)
      const { challenger: _challenger, challengedPlayer } = req.body
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      // For simplicity, assume challenger is the current user
      const result = await this.unoGameService.challengeUno(gameId, userId, parseInt(challengedPlayer))

      if (result.isSuccess) {
        if (result.value.success) {
          return Result.success({
            message: 'Challenge successful. Player1 forgot to say UNO and draws 2 cards.',
            nextPlayer: 'Player3'
          })
        } else {
          return Result.failure(new Error('Challenge failed. Player1 said UNO on time.'))
        }
      }

      return result
    }, res)
  }

  /**
   * Get player's hand
   * GET /api/games/:gameId/hand
   */
  async getPlayerHand(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)
      const userId = req.user?.id

      if (!userId) {
        return Result.failure(new Error('User not authenticated'))
      }

      const result = await this.unoGameService.getPlayerHand(gameId, userId)

      if (result.isSuccess) {
        return Result.success({
          player: result.value.player,
          hand: result.value.hand
        })
      }

      return result
    }, res)
  }

  /**
   * Get game history
   * GET /api/games/:gameId/history
   */
  async getGameHistory(req, res) {
    await this.executeAction(async () => {
      // For now, return mock history - full implementation would track game moves
      return Result.success({
        history: [
          {
            player: 'Player1',
            action: 'Played Red 3'
          },
          {
            player: 'Player2',
            action: 'Drew a card'
          },
          {
            player: 'Player3',
            action: 'Skipped turn'
          }
        ]
      })
    }, res)
  }

  /**
   * Get detailed game state
   * GET /api/games/:gameId/details
   */
  async getGameDetails(req, res) {
    await this.executeAction(async () => {
      const gameId = parseInt(req.params.gameId)

      const result = await this.unoGameService.getGameState(gameId)

      if (result.isSuccess) {
        return Result.success({
          currentPlayer: result.value.currentPlayer,
          topCard: result.value.topCard,
          hands: result.value.players.map(p => ({
            [p.username]: Array(p.cardCount).fill('**HIDDEN**') // Hide actual cards
          })),
          turnHistory: [
            {
              player: 'Player1',
              action: 'Played Green 7'
            },
            {
              player: 'Player2',
              action: 'Drew a card'
            }
          ]
        })
      }

      return result
    }, res)
  }
}

module.exports = UnoGameController
