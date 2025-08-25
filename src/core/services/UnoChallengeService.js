const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for UNO challenge operations
 * Follows Single Responsibility Principle - only handles UNO challenge mechanics
 * Integrates with UnoCallService for challenge validation
 */
class UnoChallengeService extends BaseService {
  constructor(gameRepository, gamePlayerRepository, gameCardRepository, cardRepository, unoCallService) {
    super(gameRepository)
    this.gamePlayerRepository = gamePlayerRepository
    this.gameCardRepository = gameCardRepository
    this.cardRepository = cardRepository
    this.unoCallService = unoCallService
    this.challengeHistory = new Map() // In-memory storage for challenge history
  }

  /**
   * Processes a UNO challenge between players
   * @param {number} gameId - The game ID
   * @param {string} challenger - Name of the player issuing the challenge
   * @param {string} challengedPlayer - Name of the player being challenged
   * @returns {Result} - Result containing challenge outcome
   */
  async processChallenge(gameId, challenger, challengedPlayer) {
    return Result.fromAsync(async () => {
      // Validate the challenge first
      const validationResult = await this.validateChallenge(gameId, challenger, challengedPlayer)
      if (!validationResult.isSuccess) {
        throw new Error(validationResult.error)
      }

      // Get game and players
      const gameResult = await this.repository.findByIdWithPlayers(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const challengedGamePlayer = await this.unoCallService.findGamePlayer(gameId, challengedPlayer)

      // Check if challenged player has called UNO
      const hasCalledUno = challengedGamePlayer.hasCalledUno
      const challengeSuccessful = !hasCalledUno

      let result
      if (challengeSuccessful) {
        // Challenge successful - apply penalty
        const penaltyResult = await this.applyChallengePenalty(gameId, challengedPlayer)
        if (!penaltyResult.isSuccess) {
          throw new Error('Failed to apply challenge penalty')
        }

        // Record successful challenge
        await this.recordChallengeHistory(gameId, challenger, challengedPlayer, 'successful')

        // Get next player for turn progression
        const nextPlayer = await this.getNextPlayer(gameId, challengedPlayer)

        result = {
          message: `Challenge successful. ${challengedPlayer} forgot to say UNO and draws 2 cards.`,
          nextPlayer: nextPlayer,
          challengeSuccessful: true,
          penaltyApplied: true
        }
      } else {
        // Challenge failed - no penalty
        await this.recordChallengeHistory(gameId, challenger, challengedPlayer, 'failed')

        result = {
          message: `Challenge failed. ${challengedPlayer} said UNO on time.`,
          challengeSuccessful: false,
          penaltyApplied: false
        }
      }

      return result
    })
  }

  /**
   * Validates if a challenge is valid
   * @param {number} gameId - The game ID
   * @param {string} challenger - Name of the challenger
   * @param {string} challengedPlayer - Name of the challenged player
   * @returns {Result} - Result containing validation status
   */
  async validateChallenge(gameId, challenger, challengedPlayer) {
    return Result.fromAsync(async () => {
      // Validate input
      if (!gameId || !challenger || !challengedPlayer) {
        throw new Error('Game ID, challenger, and challenged player are required')
      }

      if (challenger === challengedPlayer) {
        throw new Error('Player cannot challenge themselves')
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

      // Find both players
      const challengerPlayer = await this.unoCallService.findGamePlayer(gameId, challenger)
      const challengedGamePlayer = await this.unoCallService.findGamePlayer(gameId, challengedPlayer)

      if (!challengerPlayer) {
        throw new Error('Challenger not found in game')
      }

      if (!challengedGamePlayer) {
        throw new Error('Challenged player not found in game')
      }

      // Validate challenged player has exactly 1 card
      if (challengedGamePlayer.cardsCount !== 1) {
        throw new Error('Challenged player must have exactly 1 card to be challenged')
      }

      return {
        isValid: true,
        reason: 'Challenge is valid'
      }
    })
  }

  /**
   * Applies penalty cards to the challenged player (2 cards)
   * @param {number} gameId - The game ID
   * @param {string} challengedPlayer - Name of the challenged player
   * @returns {Result} - Result containing penalty application status
   */
  async applyChallengePenalty(gameId, challengedPlayer) {
    return Result.fromAsync(async () => {
      const challengedGamePlayer = await this.unoCallService.findGamePlayer(gameId, challengedPlayer)
      if (!challengedGamePlayer) {
        throw new Error('Challenged player not found')
      }

      // Get available cards from deck
      const availableCards = await this.getAvailableCards(gameId, 2)
      if (availableCards.length < 2) {
        throw new Error('Not enough cards in deck for penalty')
      }

      // Add 2 penalty cards to player's hand
      for (const card of availableCards) {
        await this.gameCardRepository.save({
          gameId: gameId,
          cardId: card.id,
          playerId: challengedGamePlayer.id,
          location: 'hand',
          position: challengedGamePlayer.cardsCount + availableCards.indexOf(card) + 1
        })
      }

      // Update player's card count
      await this.gamePlayerRepository.update(challengedGamePlayer.id, {
        cardsCount: challengedGamePlayer.cardsCount + 2,
        hasCalledUno: false, // Reset UNO call status after penalty
        unoCallTimestamp: null
      })

      return {
        cardsAdded: 2,
        newCardCount: challengedGamePlayer.cardsCount + 2,
        message: `${challengedPlayer} draws 2 penalty cards for not calling UNO`
      }
    })
  }

  /**
   * Records challenge history for audit purposes
   * @param {number} gameId - The game ID
   * @param {string} challenger - Name of the challenger
   * @param {string} challengedPlayer - Name of the challenged player
   * @param {string} outcome - 'successful' or 'failed'
   */
  async recordChallengeHistory(gameId, challenger, challengedPlayer, outcome) {
    const challengeRecord = {
      gameId,
      challenger,
      challengedPlayer,
      outcome,
      timestamp: new Date(),
      id: `${gameId}-${Date.now()}-${Math.random()}`
    }

    if (!this.challengeHistory.has(gameId)) {
      this.challengeHistory.set(gameId, [])
    }

    this.challengeHistory.get(gameId).push(challengeRecord)
  }

  /**
   * Gets challenge history for a game
   * @param {number} gameId - The game ID
   * @returns {Array} - Array of challenge records
   */
  getChallengeHistory(gameId) {
    return this.challengeHistory.get(gameId) || []
  }

  /**
   * Gets available cards from the deck for penalty distribution
   * @param {number} gameId - The game ID
   * @param {number} count - Number of cards needed
   * @returns {Array} - Array of available cards
   */
  async getAvailableCards(gameId, count) {
    // Get cards that are in the deck (not in players' hands or discard pile)
    const deckCards = await this.gameCardRepository.find({
      where: {
        gameId: gameId,
        location: 'deck'
      },
      relations: ['card'],
      take: count
    })

    return deckCards.map(gc => gc.card)
  }

  /**
   * Gets the next player in turn order after the challenged player
   * @param {number} gameId - The game ID
   * @param {string} currentPlayer - Current player name
   * @returns {string} - Next player name
   */
  async getNextPlayer(gameId, currentPlayer) {
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) {
      return 'Player1' // Fallback
    }

    const players = gamePlayersResult.value
    const currentIndex = players.findIndex(p => p.user.username === currentPlayer)
    
    if (currentIndex === -1) {
      return players[0]?.user?.username || 'Player1'
    }

    const nextIndex = (currentIndex + 1) % players.length
    return players[nextIndex]?.user?.username || 'Player1'
  }

  /**
   * Recursive function to process multiple challenges in sequence
   * @param {Array} challenges - Array of challenge objects
   * @param {number} index - Current challenge index
   * @returns {Result} - Result containing all challenge outcomes
   */
  async processChallengesRecursive(challenges, index = 0) {
    return Result.fromAsync(async () => {
      if (index >= challenges.length) {
        return { message: 'All challenges processed', results: [] }
      }

      const challenge = challenges[index]
      const result = await this.processChallenge(
        challenge.gameId,
        challenge.challenger,
        challenge.challengedPlayer
      )

      if (!result.isSuccess) {
        throw new Error(`Challenge ${index + 1} failed: ${result.error}`)
      }

      // Recursively process next challenge
      const remainingResult = await this.processChallengesRecursive(challenges, index + 1)
      if (!remainingResult.isSuccess) {
        throw new Error(remainingResult.error)
      }

      return {
        message: `Processed ${challenges.length} challenges`,
        results: [result.value, ...remainingResult.value.results]
      }
    })
  }

  /**
   * Generator function for monitoring challenge opportunities
   * Yields when players have 1 card but haven't called UNO
   * @param {number} gameId - The game ID
   * @returns {AsyncGenerator} - Generator yielding challenge opportunities
   */
  async* monitorChallengeOpportunities(gameId) {
    while (true) {
      try {
        const statusResult = await this.unoCallService.checkUnoStatus(gameId)
        if (statusResult.isSuccess) {
          const { playersRequiringUno } = statusResult.value

          if (playersRequiringUno.length > 0) {
            yield {
              timestamp: new Date(),
              gameId,
              challengeOpportunities: playersRequiringUno.map(playerName => ({
                challengedPlayer: playerName,
                reason: 'Player has 1 card but has not called UNO'
              }))
            }
          }
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 2000))
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
   * Recursive monitoring function for challenge opportunities
   * @param {number} gameId - The game ID
   * @param {Function} callback - Callback function to handle opportunities
   * @param {number} interval - Check interval in milliseconds
   */
  async monitorChallengeOpportunitiesRecursive(gameId, callback, interval = 3000) {
    try {
      const statusResult = await this.unoCallService.checkUnoStatus(gameId)
      if (statusResult.isSuccess) {
        const { playersRequiringUno } = statusResult.value

        if (playersRequiringUno.length > 0) {
          await callback({
            timestamp: new Date(),
            gameId,
            challengeOpportunities: playersRequiringUno.map(playerName => ({
              challengedPlayer: playerName,
              reason: 'Player has 1 card but has not called UNO'
            }))
          })
        }
      }

      // Schedule next check recursively
      setTimeout(() => {
        this.monitorChallengeOpportunitiesRecursive(gameId, callback, interval)
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

module.exports = UnoChallengeService
