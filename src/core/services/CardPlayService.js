const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for card playing operations
 * Follows Single Responsibility Principle - only handles card playing mechanics
 */
class CardPlayService extends BaseService {
  constructor(gameRepository, gamePlayerRepository, gameCardRepository, rulePlugin) {
    super(gameRepository)
    this.gamePlayerRepository = gamePlayerRepository
    this.gameCardRepository = gameCardRepository
    this.rulePlugin = rulePlugin
  }

  /**
   * Plays a card for a player in a game
   * @param {number} gameId - The game ID
   * @param {string} playerName - Name of the player playing the card
   * @param {string} cardPlayed - The card being played (e.g., "Green 7")
   * @param {string} targetColor - Color chosen for wild cards
   * @returns {Result} - Result containing success/error and next player info
   */
  async playCard(gameId, playerName, cardPlayed, targetColor = null) {
    return Result.fromAsync(async () => {
      // Validate input
      if (!gameId || !playerName || !cardPlayed) {
        throw new Error('Game ID, player name, and card are required')
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

      // Get current game state
      const gameState = await this.buildGameState(game)

      // Validate it's the player's turn
      if (gameState.currentPlayer !== playerName) {
        throw new Error('Not your turn')
      }

      // Get player's hand
      const playerHand = await this.getPlayerHand(gameId, playerName)
      if (!playerHand.includes(cardPlayed)) {
        throw new Error('Card not in player\'s hand')
      }

      // Validate card can be played
      const canPlay = this.rulePlugin.canPlayCardStrict(
        cardPlayed,
        gameState.topCard,
        gameState.currentColor
      )

      if (!canPlay) {
        throw new Error('Invalid card. Please play a card that matches the top card on the discard pile.')
      }

      // Validate wild card color selection
      if (cardPlayed.includes('Wild') && !targetColor) {
        throw new Error('Must specify target color for Wild card')
      }

      // Apply card effects and update game state
      const newGameState = this.rulePlugin.applyCardEffect(cardPlayed, gameState, targetColor)

      // Update database
      await this.updateGameAfterCardPlay(gameId, playerName, cardPlayed, newGameState, targetColor)

      // Check UNO status after card play
      await this.checkUnoStatusAfterPlay(gameId, playerName)

      return {
        message: 'Card played successfully.',
        nextPlayer: newGameState.currentPlayer
      }
    })
  }

  /**
   * Gets valid cards that a player can play
   * @param {number} gameId - The game ID
   * @param {string} playerName - Name of the player
   * @returns {Result} - Result containing array of valid cards
   */
  async getValidCardsForPlayer(gameId, playerName) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findByIdWithPlayers(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      const gameState = await this.buildGameState(game)
      const playerHand = await this.getPlayerHand(gameId, playerName)

      return this.rulePlugin.getValidCards(
        playerHand,
        gameState.topCard,
        gameState.currentColor
      )
    })
  }

  /**
   * Builds the current game state from database entities
   * @param {UnoGame} game - The game entity
   * @returns {Object} - Game state object
   */
  async buildGameState(game) {
    const players = {}
    const gamePlayersResult = await this.repository.getGamePlayers(game.id)

    if (gamePlayersResult.isSuccess) {
      for (const gamePlayer of gamePlayersResult.value) {
        const playerHand = await this.getPlayerHand(game.id, gamePlayer.user.username)
        players[gamePlayer.user.username] = {
          hand: playerHand,
          cardsCount: gamePlayer.cardsCount,
          position: gamePlayer.position
        }
      }
    }

    // Get top card from discard pile
    const topCard = await this.getTopCard(game.id)

    return {
      gameId: game.id,
      status: game.status,
      currentPlayer: await this.getCurrentPlayerName(game),
      direction: game.direction || 'clockwise',
      topCard: topCard,
      currentColor: this.extractCurrentColor(game.topCard),
      players: players
    }
  }

  /**
   * Gets a player's current hand
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @returns {Array<string>} - Array of card names
   */
  async getPlayerHand(gameId, playerName) {
    // Get player ID from username
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) return []

    const gamePlayer = gamePlayersResult.value.find(p => p.user.username === playerName)
    if (!gamePlayer) return []

    // Get cards in player's hand
    const cardsResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      playerId: gamePlayer.id,
      location: 'hand'
    })

    if (!cardsResult.isSuccess) return []

    // Convert to card names
    const cardNames = []
    for (const gameCard of cardsResult.value) {
      const cardResult = await this.gameCardRepository.findById(gameCard.cardId)
      if (cardResult.isSuccess) {
        cardNames.push(this.getCardDisplayName(cardResult.value))
      }
    }

    return cardNames
  }

  /**
   * Gets the top card from the discard pile
   * @param {number} gameId - The game ID
   * @returns {string} - Top card name
   */
  async getTopCard(gameId) {
    const topCardResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      location: 'discard'
    })

    if (!topCardResult.isSuccess || topCardResult.value.length === 0) {
      return 'Red 0' // Default starting card
    }

    // Get the most recent discard (highest position)
    const topGameCard = topCardResult.value.reduce((latest, current) =>
      current.position > latest.position ? current : latest
    )

    const cardResult = await this.gameCardRepository.findById(topGameCard.cardId)
    if (cardResult.isSuccess) {
      return this.getCardDisplayName(cardResult.value)
    }

    return 'Red 0'
  }

  /**
   * Gets current player name from game
   * @param {UnoGame} game - The game entity
   * @returns {string} - Current player name
   */
  async getCurrentPlayerName(game) {
    if (game.currentPlayerId) {
      const gamePlayersResult = await this.repository.getGamePlayers(game.id)
      if (gamePlayersResult.isSuccess) {
        const currentPlayer = gamePlayersResult.value.find(p => p.id === game.currentPlayerId)
        if (currentPlayer) {
          return currentPlayer.user.username
        }
      }
    }
    return 'Player1' // Default fallback
  }

  /**
   * Extracts current color from top card data
   * @param {Object} topCardData - Top card data from game
   * @returns {string|null} - Current color or null
   */
  extractCurrentColor(topCardData) {
    if (topCardData && topCardData.currentColor) {
      return topCardData.currentColor
    }
    return null
  }

  /**
   * Updates the game state after a card is played
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player who played the card
   * @param {string} cardPlayed - The card that was played
   * @param {Object} newGameState - Updated game state
   * @param {string} targetColor - Color chosen for wild cards
   */
  async updateGameAfterCardPlay(gameId, playerName, cardPlayed, newGameState, targetColor) {
    // Move card from player's hand to discard pile
    await this.moveCardToDiscard(gameId, playerName, cardPlayed)

    // Update game's current player
    await this.updateCurrentPlayer(gameId, newGameState.currentPlayer)

    // Update game direction if changed
    const gameResult = await this.repository.findById(gameId)
    if (gameResult.isSuccess) {
      const game = gameResult.value
      if (game.direction !== newGameState.direction) {
        await this.repository.update(gameId, { direction: newGameState.direction })
      }

      // Update top card and current color
      const topCardData = {
        card: cardPlayed,
        currentColor: targetColor || this.extractColorFromCard(cardPlayed)
      }
      await this.repository.update(gameId, { topCard: topCardData })
    }
  }

  /**
   * Moves a card from player's hand to discard pile
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @param {string} cardPlayed - Card to move
   */
  async moveCardToDiscard(gameId, playerName, cardPlayed) {
    // Find the game card in player's hand
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) return

    const gamePlayer = gamePlayersResult.value.find(p => p.user.username === playerName)
    if (!gamePlayer) return

    // Find the specific card in hand
    const playerCardsResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      playerId: gamePlayer.id,
      location: 'hand'
    })

    if (!playerCardsResult.isSuccess) return

    // Find matching card
    for (const gameCard of playerCardsResult.value) {
      const cardResult = await this.gameCardRepository.findById(gameCard.cardId)
      if (cardResult.isSuccess && this.getCardDisplayName(cardResult.value) === cardPlayed) {
        // Move to discard pile
        await this.gameCardRepository.update(gameCard.id, {
          location: 'discard',
          playerId: null,
          position: Date.now() // Use timestamp for ordering
        })

        // Update player's card count
        await this.gamePlayerRepository.update(gamePlayer.id, {
          cardsCount: gamePlayer.cardsCount - 1
        })
        break
      }
    }
  }

  /**
   * Updates the current player in the game
   * @param {number} gameId - The game ID
   * @param {string} nextPlayerName - Next player's name
   */
  async updateCurrentPlayer(gameId, nextPlayerName) {
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) return

    const nextPlayer = gamePlayersResult.value.find(p => p.user.username === nextPlayerName)
    if (nextPlayer) {
      await this.repository.update(gameId, { currentPlayerId: nextPlayer.id })
    }
  }

  /**
   * Extracts color from a card name
   * @param {string} cardName - Card name (e.g., "Green 7")
   * @returns {string} - Color name
   */
  extractColorFromCard(cardName) {
    const parts = cardName.split(' ')
    return parts[0]
  }

  /**
   * Gets display name for a card entity
   * @param {Card} card - The card entity
   * @returns {string} - Display name
   */
  getCardDisplayName(card) {
    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      return card.type === 'wild' ? 'Wild' : 'Wild Draw Four'
    }

    const colorMap = {
      'red': 'Red',
      'blue': 'Blue',
      'green': 'Green',
      'yellow': 'Yellow'
    }

    const typeMap = {
      'number': card.value,
      'skip': 'Skip',
      'reverse': 'Reverse',
      'draw_two': 'Draw Two'
    }

    const color = colorMap[card.color] || card.color
    const type = typeMap[card.type] || card.type

    return `${color} ${type}`
  }

  /**
   * Checks and updates UNO status after a card is played
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player who played the card
   */
  async checkUnoStatusAfterPlay(gameId, playerName) {
    try {
      // Import UnoCallService - in production should use DI container
      const UnoCallService = require('./UnoCallService')

      // Create service instance
      const unoCallService = new UnoCallService(
        this.repository,
        this.gamePlayerRepository,
        this.gameCardRepository
      )

      // Reset UNO call if player no longer has exactly 1 card
      await unoCallService.resetUnoCallIfNeeded(gameId, playerName)

      // Check if any players now require UNO calls
      const playersRequiringUnoResult = await unoCallService.getPlayersRequiringUno(gameId)
      if (playersRequiringUnoResult.isSuccess && playersRequiringUnoResult.value.length > 0) {
        console.log(`Players requiring UNO call: ${playersRequiringUnoResult.value.join(', ')}`)
      }
    } catch (error) {
      console.error('Error checking UNO status after card play:', error)
      // Don't throw error to avoid breaking card play functionality
    }
  }
}

module.exports = CardPlayService
