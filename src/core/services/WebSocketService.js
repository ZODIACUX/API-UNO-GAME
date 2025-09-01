const Result = require('../errors/Result')

/**
 * WebSocket Service - Multiplayer Support
 * Implements SRP (Single Responsibility Principle)
 * Handles real-time multiplayer game communication
 */
class WebSocketService {
  constructor() {
    this.clients = new Map() // userId -> WebSocket connection
    this.gameRooms = new Map() // gameId -> Set of userIds
    this.userGames = new Map() // userId -> gameId
  }

  /**
   * Add client connection
   * @param {number} userId - User ID
   * @param {WebSocket} ws - WebSocket connection
   * @param {number} gameId - Game ID
   */
  addClient(userId, ws, gameId) {
    try {
      // Store client connection
      this.clients.set(userId, ws)

      // Add to game room
      if (!this.gameRooms.has(gameId)) {
        this.gameRooms.set(gameId, new Set())
      }
      this.gameRooms.get(gameId).add(userId)

      // Track user's game
      this.userGames.set(userId, gameId)

      // Set up event handlers
      this.setupClientHandlers(userId, ws, gameId)

      console.log(`User ${userId} joined game ${gameId}`)
      return Result.success({ message: 'Client connected successfully' })
    } catch (error) {
      return Result.failure(new Error(`Failed to add client: ${error.message}`))
    }
  }

  /**
   * Remove client connection
   * @param {number} userId - User ID
   */
  removeClient(userId) {
    try {
      const gameId = this.userGames.get(userId)

      // Remove from game room
      if (gameId && this.gameRooms.has(gameId)) {
        this.gameRooms.get(gameId).delete(userId)

        // Clean up empty game rooms
        if (this.gameRooms.get(gameId).size === 0) {
          this.gameRooms.delete(gameId)
        }
      }

      // Remove client and user game tracking
      this.clients.delete(userId)
      this.userGames.delete(userId)

      console.log(`User ${userId} disconnected from game ${gameId}`)
      return Result.success({ message: 'Client disconnected successfully' })
    } catch (error) {
      return Result.failure(new Error(`Failed to remove client: ${error.message}`))
    }
  }

  /**
   * Set up WebSocket event handlers for client
   * @param {number} userId - User ID
   * @param {WebSocket} ws - WebSocket connection
   * @param {number} gameId - Game ID
   */
  setupClientHandlers(userId, ws, gameId) {
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleClientMessage(userId, gameId, message)
      } catch (error) {
        this.sendToClient(userId, {
          type: 'error',
          message: 'Invalid message format'
        })
      }
    })

    ws.on('close', () => {
      this.removeClient(userId)
      this.broadcastToGame(gameId, {
        type: 'player_left',
        userId: userId,
        timestamp: new Date().toISOString()
      })
    })

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error)
      this.removeClient(userId)
    })

    // Send welcome message
    this.sendToClient(userId, {
      type: 'connected',
      userId: userId,
      gameId: gameId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Handle incoming client message
   * @param {number} userId - User ID
   * @param {number} gameId - Game ID
   * @param {Object} message - Message object
   */
  handleClientMessage(userId, gameId, message) {
    switch (message.type) {
    case 'game_action':
      this.handleGameAction(userId, gameId, message)
      break

    case 'chat_message':
      this.handleChatMessage(userId, gameId, message)
      break

    case 'player_ready':
      this.handlePlayerReady(userId, gameId, message)
      break

    case 'ping':
      this.sendToClient(userId, { type: 'pong', timestamp: new Date().toISOString() })
      break

    default:
      this.sendToClient(userId, {
        type: 'error',
        message: `Unknown message type: ${message.type}`
      })
    }
  }

  /**
   * Handle game action messages
   * @param {number} userId - User ID
   * @param {number} gameId - Game ID
   * @param {Object} message - Game action message
   */
  handleGameAction(userId, gameId, message) {
    const gameAction = {
      type: 'game_action',
      userId: userId,
      action: message.action,
      data: message.data,
      timestamp: new Date().toISOString()
    }

    // Broadcast game action to all players in the game
    this.broadcastToGame(gameId, gameAction)
  }

  /**
   * Handle chat messages
   * @param {number} userId - User ID
   * @param {number} gameId - Game ID
   * @param {Object} message - Chat message
   */
  handleChatMessage(userId, gameId, message) {
    const chatMessage = {
      type: 'chat_message',
      userId: userId,
      message: message.message,
      timestamp: new Date().toISOString()
    }

    // Broadcast chat message to all players in the game
    this.broadcastToGame(gameId, chatMessage)
  }

  /**
   * Handle player ready status
   * @param {number} userId - User ID
   * @param {number} gameId - Game ID
   * @param {Object} message - Ready status message
   */
  handlePlayerReady(userId, gameId, message) {
    const readyMessage = {
      type: 'player_ready',
      userId: userId,
      ready: message.ready,
      timestamp: new Date().toISOString()
    }

    // Broadcast ready status to all players in the game
    this.broadcastToGame(gameId, readyMessage)
  }

  /**
   * Send message to specific client
   * @param {number} userId - User ID
   * @param {Object} message - Message to send
   */
  sendToClient(userId, message) {
    try {
      const client = this.clients.get(userId)
      if (client && client.readyState === 1) { // OPEN
        client.send(JSON.stringify(message))
      }
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error)
    }
  }

  /**
   * Broadcast message to all clients in a game
   * @param {number} gameId - Game ID
   * @param {Object} message - Message to broadcast
   */
  broadcastToGame(gameId, message) {
    try {
      const gameClients = this.gameRooms.get(gameId)
      if (gameClients) {
        gameClients.forEach(userId => {
          this.sendToClient(userId, message)
        })
      }
    } catch (error) {
      console.error(`Failed to broadcast to game ${gameId}:`, error)
    }
  }

  /**
   * Broadcast message to all clients except sender
   * @param {number} gameId - Game ID
   * @param {number} excludeUserId - User ID to exclude
   * @param {Object} message - Message to broadcast
   */
  broadcastToGameExcept(gameId, excludeUserId, message) {
    try {
      const gameClients = this.gameRooms.get(gameId)
      if (gameClients) {
        gameClients.forEach(userId => {
          if (userId !== excludeUserId) {
            this.sendToClient(userId, message)
          }
        })
      }
    } catch (error) {
      console.error(`Failed to broadcast to game ${gameId}:`, error)
    }
  }

  /**
   * Get game statistics
   * @param {number} gameId - Game ID
   * @returns {Object} Game statistics
   */
  getGameStats(gameId) {
    const gameClients = this.gameRooms.get(gameId)
    return {
      gameId: gameId,
      playerCount: gameClients ? gameClients.size : 0,
      players: gameClients ? Array.from(gameClients) : []
    }
  }

  /**
   * Get all active games
   * @returns {Array} List of active games with statistics
   */
  getActiveGames() {
    const activeGames = []
    for (const [gameId, players] of this.gameRooms) {
      activeGames.push({
        gameId: gameId,
        playerCount: players.size,
        players: Array.from(players)
      })
    }
    return activeGames
  }

  /**
   * Check if user is connected to a game
   * @param {number} userId - User ID
   * @returns {boolean} Connection status
   */
  isUserConnected(userId) {
    return this.clients.has(userId)
  }

  /**
   * Get user's current game
   * @param {number} userId - User ID
   * @returns {number|null} Game ID or null
   */
  getUserGame(userId) {
    return this.userGames.get(userId) || null
  }

  /**
   * Send game state update to all players
   * @param {number} gameId - Game ID
   * @param {Object} gameState - Game state data
   */
  sendGameStateUpdate(gameId, gameState) {
    this.broadcastToGame(gameId, {
      type: 'game_state_update',
      gameState: gameState,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send player hand update to specific player
   * @param {number} userId - User ID
   * @param {Array} hand - Player's hand
   */
  sendPlayerHandUpdate(userId, hand) {
    this.sendToClient(userId, {
      type: 'hand_update',
      hand: hand,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send turn notification to current player
   * @param {number} userId - User ID
   * @param {Object} turnData - Turn information
   */
  sendTurnNotification(userId, turnData) {
    this.sendToClient(userId, {
      type: 'your_turn',
      turnData: turnData,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send game over notification to all players
   * @param {number} gameId - Game ID
   * @param {Object} gameResult - Game result data
   */
  sendGameOver(gameId, gameResult) {
    this.broadcastToGame(gameId, {
      type: 'game_over',
      result: gameResult,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Clean up inactive connections
   */
  cleanup() {
    const _now = Date.now()
    const _timeout = 5 * 60 * 1000 // 5 minutes

    for (const [userId, ws] of this.clients) {
      if (ws.readyState !== 1) { // Not OPEN
        this.removeClient(userId)
      }
    }
  }
}

module.exports = WebSocketService
