const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * UNO Game Service - Implements SRP (Single Responsibility Principle)
 * Handles all UNO game logic and state management
 */
class UnoGameService extends BaseService {
  constructor(gameRepository, gameParticipantRepository, cardRepository) {
    super(gameRepository)
    this.gameParticipantRepository = gameParticipantRepository
    this.cardRepository = cardRepository
    this.gameStates = new Map() // In-memory game state storage
  }

  /**
   * Create a new UNO game
   * @param {string} name - Game name
   * @param {number} creatorId - Creator user ID
   * @param {number} maxPlayers - Maximum number of players
   * @returns {Promise<Result>} Result containing created game
   */
  async createGame(name, creatorId, maxPlayers = 4) {
    return Result.fromAsync(async () => {
      const game = await this.repository.create({
        name,
        creatorId,
        maxPlayers,
        status: 'waiting',
        currentDirection: 'clockwise',
        currentPlayer: null,
        currentColor: null,
        currentValue: null,
        gameData: {
          deck: this.generateDeck(),
          discardPile: [],
          players: new Map(),
          turnHistory: []
        }
      })

      // Initialize game state
      this.gameStates.set(game.id, {
        deck: this.generateDeck(),
        discardPile: [],
        players: new Map(),
        currentPlayerIndex: 0,
        direction: 'clockwise',
        turnHistory: []
      })

      return game
    })
  }

  /**
   * Join an existing game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @param {string} username - Username
   * @returns {Promise<Result>} Result containing join result
   */
  async joinGame(gameId, userId, username) {
    return Result.fromAsync(async () => {
      const game = await this.repository.findById(gameId)
      if (!game.isSuccess) {
        throw new Error('Game not found')
      }

      if (game.value.status !== 'waiting') {
        throw new Error('Game already started')
      }

      // Check if user is already in game
      const existingParticipant = await this.gameParticipantRepository.findOne({
        gameId,
        userId
      })

      if (existingParticipant.isSuccess) {
        throw new Error('User already in game')
      }

      // Add participant
      await this.gameParticipantRepository.create({
        gameId,
        userId,
        username,
        isReady: false,
        score: 0,
        cards: []
      })

      return { message: 'User joined the game successfully' }
    })
  }

  /**
   * Start the game when all players are ready
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID (must be creator)
   * @returns {Promise<Result>} Result containing start result
   */
  async startGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const game = await this.repository.findById(gameId)
      if (!game.isSuccess) {
        throw new Error('Game not found')
      }

      if (game.value.creatorId !== userId) {
        throw new Error('Only game creator can start the game')
      }

      // Get all participants
      const participants = await this.gameParticipantRepository.findBy({ gameId })
      if (!participants.isSuccess || participants.value.length < 2) {
        throw new Error('Need at least 2 players to start')
      }

      // Check if all players are ready
      const notReadyPlayers = participants.value.filter(p => !p.isReady)
      if (notReadyPlayers.length > 0) {
        throw new Error('All players must be ready to start')
      }

      // Initialize game state
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game state not found')
      }

      // Deal initial cards (7 cards per player)
      const players = participants.value
      for (const participant of players) {
        const cards = []
        for (let i = 0; i < 7; i++) {
          const card = gameState.deck.pop()
          if (card) {
            cards.push(card)
          }
        }
        gameState.players.set(participant.userId, {
          id: participant.userId,
          username: participant.username,
          cards: cards,
          isUno: false
        })
      }

      // Place first card on discard pile
      const firstCard = gameState.deck.pop()
      if (firstCard) {
        gameState.discardPile.push(firstCard)
        gameState.currentColor = this.getCardColor(firstCard)
        gameState.currentValue = this.getCardValue(firstCard)
      }

      // Update game status
      await this.repository.update(gameId, {
        status: 'in_progress',
        currentPlayerId: players[0].userId
      })

      gameState.currentPlayerIndex = 0

      return { message: 'Game started successfully' }
    })
  }

  /**
   * Play a card
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @param {string} cardPlayed - Card to play
   * @returns {Promise<Result>} Result containing play result
   */
  async playCard(gameId, playerId, cardPlayed) {
    return Result.fromAsync(async () => {
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game not found')
      }

      const currentPlayer = gameState.players.get(playerId)
      if (!currentPlayer) {
        throw new Error('Player not in game')
      }

      // Check if it's player's turn
      const players = Array.from(gameState.players.values())
      if (players[gameState.currentPlayerIndex].id !== playerId) {
        throw new Error('Not your turn')
      }

      // Check if player has the card
      if (!currentPlayer.cards.includes(cardPlayed)) {
        throw new Error('Card not in player hand')
      }

      // Validate card can be played
      if (!this.canPlayCard(cardPlayed, gameState.currentColor, gameState.currentValue)) {
        throw new Error('Invalid card play')
      }

      // Remove card from player hand
      currentPlayer.cards = currentPlayer.cards.filter(card => card !== cardPlayed)

      // Add to discard pile
      gameState.discardPile.push(cardPlayed)

      // Update current color and value
      gameState.currentColor = this.getCardColor(cardPlayed)
      gameState.currentValue = this.getCardValue(cardPlayed)

      // Handle special cards
      const result = await this.handleSpecialCard(gameId, cardPlayed, gameState)

      // Move to next player
      this.nextPlayer(gameState)

      // Check for UNO
      if (currentPlayer.cards.length === 1 && !currentPlayer.isUno) {
        // Player should have said UNO but didn't
        await this.drawCards(gameId, playerId, 2)
      }

      // Check for win
      if (currentPlayer.cards.length === 0) {
        await this.endGame(gameId, playerId)
        return { message: 'Game won!', winner: currentPlayer.username }
      }

      // Reset UNO status
      currentPlayer.isUno = false

      return {
        message: 'Card played successfully',
        nextPlayer: players[gameState.currentPlayerIndex].username,
        ...result
      }
    })
  }

  /**
   * Draw a card when player cannot play
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing draw result
   */
  async drawCard(gameId, playerId) {
    return Result.fromAsync(async () => {
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game not found')
      }

      const player = gameState.players.get(playerId)
      if (!player) {
        throw new Error('Player not in game')
      }

      if (gameState.deck.length === 0) {
        throw new Error('No cards left in deck')
      }

      const drawnCard = gameState.deck.pop()
      player.cards.push(drawnCard)

      // Check if drawn card can be played
      const canPlay = this.canPlayCard(drawnCard, gameState.currentColor, gameState.currentValue)

      // Move to next player if card cannot be played
      if (!canPlay) {
        this.nextPlayer(gameState)
      }

      return {
        message: 'Card drawn successfully',
        drawnCard,
        canPlay,
        nextPlayer: canPlay ? player.username : Array.from(gameState.players.values())[gameState.currentPlayerIndex].username
      }
    })
  }

  /**
   * Say UNO when player has one card left
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing UNO result
   */
  async sayUno(gameId, playerId) {
    return Result.fromAsync(async () => {
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game not found')
      }

      const player = gameState.players.get(playerId)
      if (!player) {
        throw new Error('Player not in game')
      }

      if (player.cards.length !== 1) {
        throw new Error('Can only say UNO when you have one card')
      }

      player.isUno = true

      return { message: 'UNO said successfully' }
    })
  }

  /**
   * Challenge a player who didn't say UNO
   * @param {number} gameId - Game ID
   * @param {number} challengerId - Challenger player ID
   * @param {number} challengedId - Challenged player ID
   * @returns {Promise<Result>} Result containing challenge result
   */
  async challengeUno(gameId, challengerId, challengedId) {
    return Result.fromAsync(async () => {
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game not found')
      }

      const challengedPlayer = gameState.players.get(challengedId)
      if (!challengedPlayer) {
        throw new Error('Challenged player not in game')
      }

      if (challengedPlayer.cards.length !== 1) {
        throw new Error('Player does not have one card')
      }

      if (challengedPlayer.isUno) {
        // Challenge failed - challenger draws 2 cards
        await this.drawCards(gameId, challengerId, 2)
        return {
          message: 'Challenge failed. Challenger draws 2 cards.',
          success: false
        }
      } else {
        // Challenge successful - challenged player draws 2 cards
        await this.drawCards(gameId, challengedId, 2)
        return {
          message: 'Challenge successful. Challenged player draws 2 cards.',
          success: true
        }
      }
    })
  }

  /**
   * Get current game state
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing game state
   */
  async getGameState(gameId) {
    return Result.fromAsync(async () => {
      const game = await this.repository.findById(gameId)
      if (!game.isSuccess) {
        throw new Error('Game not found')
      }

      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game state not found')
      }

      const players = Array.from(gameState.players.values())
      const currentPlayer = players[gameState.currentPlayerIndex]

      return {
        gameId,
        status: game.value.status,
        currentPlayer: currentPlayer ? currentPlayer.username : null,
        currentColor: gameState.currentColor,
        currentValue: gameState.currentValue,
        topCard: gameState.discardPile[gameState.discardPile.length - 1],
        direction: gameState.direction,
        players: players.map(p => ({
          username: p.username,
          cardCount: p.cards.length,
          isUno: p.isUno
        }))
      }
    })
  }

  /**
   * Get player's hand
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing player's hand
   */
  async getPlayerHand(gameId, playerId) {
    return Result.fromAsync(async () => {
      const gameState = this.gameStates.get(gameId)
      if (!gameState) {
        throw new Error('Game not found')
      }

      const player = gameState.players.get(playerId)
      if (!player) {
        throw new Error('Player not in game')
      }

      return {
        player: player.username,
        hand: player.cards,
        cardCount: player.cards.length
      }
    })
  }

  /**
   * Get game scores
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing scores
   */
  async getScores(gameId) {
    return Result.fromAsync(async () => {
      const participants = await this.gameParticipantRepository.findBy({ gameId })
      if (!participants.isSuccess) {
        throw new Error('Game not found')
      }

      const scores = {}
      participants.value.forEach(p => {
        scores[p.username] = p.score
      })

      return { scores }
    })
  }

  // Helper methods

  generateDeck() {
    const colors = ['Red', 'Blue', 'Green', 'Yellow']
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    const specials = ['Skip', 'Reverse', 'Draw Two']
    const deck = []

    // Add number cards
    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push(`${color} ${number}`)
        if (number !== '0') {
          deck.push(`${color} ${number}`) // Two of each number except 0
        }
      })

      // Add special cards
      specials.forEach(special => {
        deck.push(`${color} ${special}`)
        deck.push(`${color} ${special}`)
      })
    })

    // Add wild cards
    for (let i = 0; i < 4; i++) {
      deck.push('Wild')
      deck.push('Wild Draw Four')
    }

    return this.shuffleDeck(deck)
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }

  getCardColor(card) {
    if (card.startsWith('Wild')) return 'black'
    return card.split(' ')[0]
  }

  getCardValue(card) {
    if (card.startsWith('Wild')) return card.split(' ').slice(1).join(' ')
    return card.split(' ').slice(1).join(' ')
  }

  canPlayCard(card, currentColor, currentValue) {
    const cardColor = this.getCardColor(card)
    const cardValue = this.getCardValue(card)

    // Wild cards can always be played
    if (cardColor === 'black') return true

    // Same color or same value
    return cardColor === currentColor || cardValue === currentValue
  }

  async handleSpecialCard(gameId, card, gameState) {
    const cardValue = this.getCardValue(card)
    const result = {}

    switch (cardValue) {
    case 'Skip':
      // Skip next player
      this.nextPlayer(gameState)
      result.skippedPlayer = Array.from(gameState.players.values())[gameState.currentPlayerIndex].username
      break

    case 'Reverse':
      // Reverse direction
      gameState.direction = gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise'
      result.newDirection = gameState.direction
      break

    case 'Draw Two': {
      // Next player draws 2 cards
      const nextPlayer = Array.from(gameState.players.values())[gameState.currentPlayerIndex]
      await this.drawCards(gameId, nextPlayer.id, 2)
      result.drawTwo = { player: nextPlayer.username, cards: 2 }
      break
    }

    case 'Draw Four': {
      // Next player draws 4 cards
      const nextPlayerForFour = Array.from(gameState.players.values())[gameState.currentPlayerIndex]
      await this.drawCards(gameId, nextPlayerForFour.id, 4)
      result.drawFour = { player: nextPlayerForFour.username, cards: 4 }
      break
    }
    }

    return result
  }

  nextPlayer(gameState) {
    const players = Array.from(gameState.players.values())
    if (gameState.direction === 'clockwise') {
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % players.length
    } else {
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex - 1 + players.length) % players.length
    }
  }

  async drawCards(gameId, playerId, count) {
    const gameState = this.gameStates.get(gameId)
    const player = gameState.players.get(playerId)

    for (let i = 0; i < count; i++) {
      if (gameState.deck.length === 0) {
        // Reshuffle discard pile if deck is empty
        this.reshuffleDeck(gameState)
      }

      if (gameState.deck.length > 0) {
        const card = gameState.deck.pop()
        player.cards.push(card)
      }
    }
  }

  reshuffleDeck(gameState) {
    if (gameState.discardPile.length > 1) {
      // Keep the top card, shuffle the rest back into deck
      const topCard = gameState.discardPile.pop()
      gameState.deck = this.shuffleDeck(gameState.discardPile)
      gameState.discardPile = [topCard]
    }
  }

  async endGame(gameId, winnerId) {
    const gameState = this.gameStates.get(gameId)
    const winner = gameState.players.get(winnerId)

    // Calculate final scores
    const players = Array.from(gameState.players.values())
    const scores = {}

    for (const player of players) {
      let score = 0
      for (const card of player.cards) {
        score += this.getCardPoints(card)
      }
      scores[player.username] = score

      // Update participant score in database
      await this.gameParticipantRepository.update(
        { gameId, userId: player.id },
        { score }
      )
    }

    // Update game status
    await this.repository.update(gameId, {
      status: 'finished',
      winnerId
    })

    return { winner: winner.username, scores }
  }

  getCardPoints(card) {
    const value = this.getCardValue(card)

    if (card.startsWith('Wild')) {
      return value === 'Draw Four' ? 50 : 40
    }

    switch (value) {
    case 'Skip':
    case 'Reverse':
    case 'Draw Two':
      return 20
    default:
      return parseInt(value) || 0
    }
  }
}

module.exports = UnoGameService
