const GameRulePlugin = require('./GameRulePlugin')

/**
 * Standard UNO rules implementation
 * Demonstrates Open/Closed Principle - extends base plugin without modifying it
 */
class StandardUnoRulePlugin extends GameRulePlugin {
  constructor() {
    super('StandardUnoRules', '1.0.0')
    this.priority = 100 // Higher priority for standard rules
  }

  validateMove(gameState, move, player) {
    const { card, targetPlayer } = move
    const { topCard, currentPlayer } = gameState

    // Check if it's the player's turn
    if (currentPlayer !== player.username) {
      return { valid: false, message: 'Not your turn' }
    }

    // Check if card can be played
    if (!this.canPlayCard(card, topCard)) {
      return { valid: false, message: 'Card cannot be played on current top card' }
    }

    // Validate special card rules
    if (this.isActionCard(card)) {
      return this.validateActionCard(card, targetPlayer, gameState)
    }

    return { valid: true, message: 'Valid move' }
  }

  processMove(gameState, move, player) {
    const { card } = move
    const newGameState = { ...gameState }

    // Update top card
    newGameState.topCard = card

    // Remove card from player's hand
    if (newGameState.players[player.username]) {
      const playerHand = newGameState.players[player.username].hand
      const cardIndex = playerHand.indexOf(card)
      if (cardIndex > -1) {
        playerHand.splice(cardIndex, 1)
      }
    }

    // Process special card effects
    if (this.isActionCard(card)) {
      return this.processActionCard(card, move, newGameState)
    }

    // Move to next player
    newGameState.currentPlayer = this.getNextPlayer(newGameState)

    return newGameState
  }

  calculateScore(gameState, player) {
    const playerData = gameState.players[player.username]
    if (!playerData || !playerData.hand) {
      return 0
    }

    let score = 0
    for (const card of playerData.hand) {
      score += this.getCardValue(card)
    }

    return score
  }

  onGameStart(gameState) {
    const newGameState = { ...gameState }

    // Deal initial cards to each player
    const playerNames = Object.keys(newGameState.players)
    for (const playerName of playerNames) {
      newGameState.players[playerName].hand = this.dealInitialCards(newGameState.deck)
    }

    // Set initial top card
    newGameState.topCard = this.drawCard(newGameState.deck)

    return newGameState
  }

  // Helper methods
  canPlayCard(card, topCard) {
    if (!topCard) return true

    const cardParts = card.split(' ')
    const topCardParts = topCard.split(' ')

    // Wild cards can always be played
    if (cardParts[0] === 'Wild') return true

    // Same color or same value/action
    return cardParts[0] === topCardParts[0] || cardParts[1] === topCardParts[1]
  }

  isActionCard(card) {
    const actionCards = ['Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild Draw Four']
    return actionCards.some(action => card.includes(action))
  }

  validateActionCard(card, targetPlayer, __gameState) {
    if (card.includes('Wild') && !targetPlayer) {
      return { valid: false, message: 'Must specify target color for Wild card' }
    }

    return { valid: true, message: 'Valid action card' }
  }

  processActionCard(card, move, gameState) {
    const newGameState = { ...gameState }

    if (card.includes('Skip')) {
      // Skip next player
      newGameState.currentPlayer = this.getNextPlayer(newGameState, 2)
    } else if (card.includes('Reverse')) {
      // Reverse direction
      newGameState.direction = newGameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise'
      newGameState.currentPlayer = this.getNextPlayer(newGameState)
    } else if (card.includes('Draw Two')) {
      // Next player draws 2 cards and loses turn
      const nextPlayer = this.getNextPlayer(newGameState)
      this.drawCards(newGameState, nextPlayer, 2)
      newGameState.currentPlayer = this.getNextPlayer(newGameState, 2)
    } else if (card.includes('Wild Draw Four')) {
      // Next player draws 4 cards and loses turn
      const nextPlayer = this.getNextPlayer(newGameState)
      this.drawCards(newGameState, nextPlayer, 4)
      newGameState.currentPlayer = this.getNextPlayer(newGameState, 2)
      // Set new color from move
      if (move.targetColor) {
        newGameState.topCard = `${move.targetColor} Wild`
      }
    } else if (card.includes('Wild')) {
      // Set new color
      if (move.targetColor) {
        newGameState.topCard = `${move.targetColor} Wild`
      }
      newGameState.currentPlayer = this.getNextPlayer(newGameState)
    }

    return newGameState
  }

  getNextPlayer(gameState, skip = 1) {
    const playerNames = Object.keys(gameState.players)
    const currentIndex = playerNames.indexOf(gameState.currentPlayer)

    let nextIndex
    if (gameState.direction === 'clockwise') {
      nextIndex = (currentIndex + skip) % playerNames.length
    } else {
      nextIndex = (currentIndex - skip + playerNames.length) % playerNames.length
    }

    return playerNames[nextIndex]
  }

  getCardValue(card) {
    if (card.includes('Wild')) return 50
    if (card.includes('Skip') || card.includes('Reverse') || card.includes('Draw Two')) return 20

    const parts = card.split(' ')
    const value = parts[1]
    return isNaN(value) ? 0 : parseInt(value)
  }

  dealInitialCards(deck, count = 7) {
    const hand = []
    for (let i = 0; i < count; i++) {
      if (deck.length > 0) {
        hand.push(deck.pop())
      }
    }
    return hand
  }

  drawCard(deck) {
    return deck.length > 0 ? deck.pop() : null
  }

  drawCards(gameState, playerName, count) {
    if (!gameState.players[playerName]) return

    for (let i = 0; i < count; i++) {
      const card = this.drawCard(gameState.deck)
      if (card) {
        gameState.players[playerName].hand.push(card)
      }
    }
  }
}

module.exports = StandardUnoRulePlugin
