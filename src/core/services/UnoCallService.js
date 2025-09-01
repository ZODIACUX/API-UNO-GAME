const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for UNO call operations
 * Follows Single Responsibility Principle - only handles UNO call mechanics
 */
class UnoCallService extends BaseService {
  constructor(gameRepository, gamePlayerRepository, gameCardRepository) {
    super(gameRepository)
    this.gamePlayerRepository = gamePlayerRepository
    this.gameCardRepository = gameCardRepository
  }

  /**
   * Records a UNO call for a player
   * @param {number} gameId - The game ID
   * @param {string} playerName - Name of the player calling UNO
   * @returns {Result} - Result containing success/error message
   */
  async callUno(gameId, playerName) {
    return Result.fromAsync(async () => {
      // Validate input
      if (!gameId || !playerName) {
        throw new Error('Game ID and player name are required')
      }

      // Get game with current state
      const gameResult = await this.repository.findByIdWithPlayers(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.status !== 'in_progress') {
        throw new Error('Game is not in progress')
      }

      // Find the player
      const gamePlayer = await this.findGamePlayer(gameId, playerName)
      if (!gamePlayer) {
        throw new Error('Player not found in game')
      }

      // Validate player has exactly 1 card
      if (gamePlayer.cardsCount !== 1) {
        throw new Error('Player must have exactly 1 card to call UNO')
      }

      // Check if player already called UNO
      if (gamePlayer.hasCalledUno) {
        throw new Error('Player has already called UNO')
      }

      // Record UNO call
      await this.recordUnoCall(gamePlayer.id)

      return {
        message: `${playerName} said UNO successfully.`
      }
    })
  }

  /**
   * Checks UNO status for all players in a game
   * @param {number} gameId - The game ID
   * @returns {Result} - Result containing UNO status information
   */
  async checkUnoStatus(gameId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findByIdWithPlayers(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const gamePlayersResult = await this.repository.getGamePlayers(gameId)
      if (!gamePlayersResult.isSuccess) {
        return { playersRequiringUno: [], playersWithUno: [] }
      }

      const playersRequiringUno = []
      const playersWithUno = []

      for (const gamePlayer of gamePlayersResult.value) {
        if (gamePlayer.cardsCount === 1) {
          if (gamePlayer.hasCalledUno) {
            playersWithUno.push({
              playerName: gamePlayer.user.username,
              calledAt: gamePlayer.unoCallTimestamp
            })
          } else {
            playersRequiringUno.push(gamePlayer.user.username)
          }
        }
      }

      return {
        playersRequiringUno,
        playersWithUno
      }
    })
  }

  /**
   * Gets players who need to call UNO (have 1 card but haven't called)
   * @param {number} gameId - The game ID
   * @returns {Result} - Result containing array of player names
   */
  async getPlayersRequiringUno(gameId) {
    return Result.fromAsync(async () => {
      const statusResult = await this.checkUnoStatus(gameId)
      if (!statusResult.isSuccess) {
        throw new Error('Unable to check UNO status')
      }

      return statusResult.value.playersRequiringUno
    })
  }

  /**
   * Validates if a UNO call is valid for a player
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @returns {Result} - Result containing validation result
   */
  async validateUnoCall(gameId, playerName) {
    return Result.fromAsync(async () => {
      const gamePlayer = await this.findGamePlayer(gameId, playerName)
      if (!gamePlayer) {
        throw new Error('Player not found in game')
      }

      const isValid = gamePlayer.cardsCount === 1 && !gamePlayer.hasCalledUno

      return {
        isValid,
        reason: isValid ? 'Valid UNO call' :
          gamePlayer.cardsCount !== 1 ? 'Player does not have exactly 1 card' :
            'Player has already called UNO'
      }
    })
  }

  /**
   * Monitors card counts and automatically detects UNO situations
   * Uses generator pattern for continuous monitoring
   * @param {number} gameId - The game ID
   * @returns {AsyncGenerator} - Generator yielding UNO status updates
   */
  async* monitorUnoSituations(gameId) {
    while (true) {
      try {
        const statusResult = await this.checkUnoStatus(gameId)
        if (statusResult.isSuccess) {
          yield {
            timestamp: new Date(),
            gameId,
            status: statusResult.value
          }
        }

        // Wait before next check (in real implementation, this could be event-driven)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        yield {
          timestamp: new Date(),
          gameId,
          error: error.message
        }
        break
      }
    }
  }

  /**
   * Resets UNO call status when player draws cards (no longer has 1 card)
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @returns {Result} - Result containing reset status
   */
  async resetUnoCallIfNeeded(gameId, playerName) {
    return Result.fromAsync(async () => {
      const gamePlayer = await this.findGamePlayer(gameId, playerName)
      if (!gamePlayer) {
        throw new Error('Player not found in game')
      }

      // Reset UNO call if player no longer has exactly 1 card
      if (gamePlayer.cardsCount !== 1 && gamePlayer.hasCalledUno) {
        await this.gamePlayerRepository.update(gamePlayer.id, {
          hasCalledUno: false,
          unoCallTimestamp: null
        })

        return {
          reset: true,
          message: `UNO call reset for ${playerName} (now has ${gamePlayer.cardsCount} cards)`
        }
      }

      return {
        reset: false,
        message: 'No reset needed'
      }
    })
  }

  /**
   * Records a UNO call in the database
   * @param {number} gamePlayerId - The game player ID
   */
  async recordUnoCall(gamePlayerId) {
    await this.gamePlayerRepository.update(gamePlayerId, {
      hasCalledUno: true,
      unoCallTimestamp: new Date()
    })
  }

  /**
   * Finds a game player by game ID and player name
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @returns {GamePlayer|null} - Game player entity or null
   */
  async findGamePlayer(gameId, playerName) {
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) {
      return null
    }

    return gamePlayersResult.value.find(p => p.user.username === playerName) || null
  }

  /**
   * Recursive function to continuously monitor UNO status
   * @param {number} gameId - The game ID
   * @param {Function} callback - Callback function to handle status updates
   * @param {number} interval - Check interval in milliseconds
   */
  async monitorUnoStatusRecursive(gameId, callback, interval = 5000) {
    try {
      const statusResult = await this.checkUnoStatus(gameId)
      if (statusResult.isSuccess) {
        await callback({
          timestamp: new Date(),
          gameId,
          status: statusResult.value
        })
      }

      // Schedule next check
      setTimeout(() => {
        this.monitorUnoStatusRecursive(gameId, callback, interval)
      }, interval)
    } catch (error) {
      await callback({
        timestamp: new Date(),
        gameId,
        error: error.message
      })
    }
  }
}

module.exports = UnoCallService