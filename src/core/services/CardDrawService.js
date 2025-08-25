const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for card drawing operations
 * Follows Single Responsibility Principle - only handles card drawing mechanics
 */
class CardDrawService extends BaseService {
  constructor(gameRepository, gamePlayerRepository, gameCardRepository, cardRepository, rulePlugin) {
    super(gameRepository)
    this.gamePlayerRepository = gamePlayerRepository
    this.gameCardRepository = gameCardRepository
    this.cardRepository = cardRepository
    this.rulePlugin = rulePlugin
  }

  /**
   * Draws a card for a player when they have no valid plays
   * @param {number} gameId - The game ID
   * @param {string} playerName - Name of the player drawing the card
   * @returns {Result} - Result containing success/error and card drawn info
   */
  async drawCard(gameId, playerName) {
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

      // Get current game state
      const gameState = await this.buildGameState(game)

      // Validate it's the player's turn
      if (gameState.currentPlayer !== playerName) {
        throw new Error('Not your turn')
      }

      // Check if player can draw (has no valid cards to play)
      const canDraw = await this.canPlayerDraw(gameId, playerName, gameState)
      if (!canDraw) {
        throw new Error('You have valid cards to play. You cannot draw a card.')
      }

      // Draw card from deck
      const drawnCard = await this.drawCardFromDeck(gameId)
      if (!drawnCard) {
        throw new Error('Unable to draw card from deck')
      }

      // Add card to player's hand
      await this.addCardToPlayerHand(gameId, playerName, drawnCard)

      // Move to next player (drawing ends the turn)
      await this.moveToNextPlayer(gameId, gameState)

      // Check UNO status after drawing card
      await this.checkUnoStatusAfterDraw(gameId, playerName)

      return {
        message: `${playerName} drew a card from the deck.`,
        cardDrawn: drawnCard
      }
    })
  }

  /**
   * Checks if a player can draw a card (has no valid plays)
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @param {Object} gameState - Current game state
   * @returns {boolean} - True if player can draw
   */
  async canPlayerDraw(gameId, playerName, gameState) {
    // Get player's hand
    const playerHand = await this.getPlayerHand(gameId, playerName)
    if (playerHand.length === 0) {
      return false // Player has no cards, shouldn't be able to draw
    }

    // Get valid cards using rule plugin
    const validCards = this.rulePlugin.getValidCards(
      playerHand,
      gameState.topCard,
      gameState.currentColor
    )

    // Player can draw only if they have no valid cards to play
    return validCards.length === 0
  }

  /**
   * Draws a card from the deck, reshuffling if necessary
   * @param {number} gameId - The game ID
   * @returns {string|null} - Card name or null if unable to draw
   */
  async drawCardFromDeck(gameId) {
    // Get cards in deck
    const deckCardsResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      location: 'deck'
    })

    let deckCards = deckCardsResult.isSuccess ? deckCardsResult.value : []

    // If deck is empty, reshuffle discard pile
    if (deckCards.length === 0) {
      const reshuffleResult = await this.reshuffleDeckIfNeeded(gameId)
      if (!reshuffleResult) {
        return null // Unable to reshuffle
      }

      // Get deck cards again after reshuffling
      const newDeckResult = await this.gameCardRepository.findBy({
        gameId: gameId,
        location: 'deck'
      })
      deckCards = newDeckResult.isSuccess ? newDeckResult.value : []
    }

    if (deckCards.length === 0) {
      return null // Still no cards available
    }

    // Get a random card from deck
    const randomIndex = Math.floor(Math.random() * deckCards.length)
    const gameCard = deckCards[randomIndex]

    // Get card details
    const cardResult = await this.gameCardRepository.findById(gameCard.cardId)
    if (!cardResult.isSuccess) {
      return null
    }

    const card = cardResult.value
    const cardName = this.getCardDisplayName(card)

    // Remove card from deck (will be added to player's hand)
    await this.gameCardRepository.update(gameCard.id, {
      location: 'hand', // Temporarily set to hand, will be updated with player info
      position: Date.now()
    })

    return cardName
  }

  /**
   * Reshuffles discard pile into deck when deck is empty
   * @param {number} gameId - The game ID
   * @returns {boolean} - True if reshuffling was successful
   */
  async reshuffleDeckIfNeeded(gameId) {
    // Get discard pile cards (except the top card)
    const discardResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      location: 'discard'
    })

    if (!discardResult.isSuccess || discardResult.value.length <= 1) {
      return false // Need at least 2 cards in discard (keep top card)
    }

    const discardCards = discardResult.value
    // Sort by position to find the top card
    discardCards.sort((a, b) => b.position - a.position)


    // Keep the top card in discard, move others to deck
    for (let i = 1; i < discardCards.length; i++) {
      const gameCard = discardCards[i]
      await this.gameCardRepository.update(gameCard.id, {
        location: 'deck',
        playerId: null,
        position: Math.random() // Random position for shuffling
      })
    }

    return true
  }

  /**
   * Adds a drawn card to player's hand
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player name
   * @param {string} cardName - Name of the card to add
   */
  async addCardToPlayerHand(gameId, playerName, cardName) {
    // Get player info
    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) return

    const gamePlayer = gamePlayersResult.value.find(p => p.user.username === playerName)
    if (!gamePlayer) return

    // Find the card that was just drawn (should be in 'hand' location but without playerId)
    const drawnCardResult = await this.gameCardRepository.findBy({
      gameId: gameId,
      location: 'hand',
      playerId: null
    })

    if (!drawnCardResult.isSuccess || drawnCardResult.value.length === 0) return

    // Find the specific card by name
    for (const gameCard of drawnCardResult.value) {
      const cardResult = await this.gameCardRepository.findById(gameCard.cardId)
      if (cardResult.isSuccess && this.getCardDisplayName(cardResult.value) === cardName) {
        // Update card to belong to player
        await this.gameCardRepository.update(gameCard.id, {
          playerId: gamePlayer.id,
          position: Date.now()
        })

        // Update player's card count
        await this.gamePlayerRepository.update(gamePlayer.id, {
          cardsCount: gamePlayer.cardsCount + 1
        })
        break
      }
    }
  }

  /**
   * Moves to the next player after drawing
   * @param {number} gameId - The game ID
   * @param {Object} gameState - Current game state
   */
  async moveToNextPlayer(gameId, gameState) {
    const nextPlayer = this.getNextPlayer(gameState)

    const gamePlayersResult = await this.repository.getGamePlayers(gameId)
    if (!gamePlayersResult.isSuccess) return

    const nextGamePlayer = gamePlayersResult.value.find(p => p.user.username === nextPlayer)
    if (nextGamePlayer) {
      await this.repository.update(gameId, { currentPlayerId: nextGamePlayer.id })
    }
  }

  /**
   * Gets the next player in turn order
   * @param {Object} gameState - Current game state
   * @returns {string} - Next player name
   */
  getNextPlayer(gameState) {
    const playerNames = Object.keys(gameState.players)
    const currentIndex = playerNames.indexOf(gameState.currentPlayer)

    let nextIndex
    if (gameState.direction === 'clockwise') {
      nextIndex = (currentIndex + 1) % playerNames.length
    } else {
      nextIndex = (currentIndex - 1 + playerNames.length) % playerNames.length
    }

    return playerNames[nextIndex]
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
   * Checks and updates UNO status after a card is drawn
   * @param {number} gameId - The game ID
   * @param {string} playerName - Player who drew the card
   */
  async checkUnoStatusAfterDraw(gameId, playerName) {
    try {
      // Import UnoCallService - in production should use DI container
      const UnoCallService = require('./UnoCallService')

      // Create service instance
      const unoCallService = new UnoCallService(
        this.repository,
        this.gamePlayerRepository,
        this.gameCardRepository
      )

      // Reset UNO call if player no longer has exactly 1 card (they drew a card)
      await unoCallService.resetUnoCallIfNeeded(gameId, playerName)

      // Check if any players now require UNO calls
      const playersRequiringUnoResult = await unoCallService.getPlayersRequiringUno(gameId)
      if (playersRequiringUnoResult.isSuccess && playersRequiringUnoResult.value.length > 0) {
        console.log(`Players requiring UNO call: ${playersRequiringUnoResult.value.join(', ')}`)
      }
    } catch (error) {
      console.error('Error checking UNO status after card draw:', error)
      // Don't throw error to avoid breaking card draw functionality
    }
  }
}

module.exports = CardDrawService
