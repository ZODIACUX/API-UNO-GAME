const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for card distribution operations
 * Follows Single Responsibility Principle - only handles card dealing mechanics
 */
class CardDistributionService extends BaseService {
  constructor(gameRepository, gamePlayerRepository, gameCardRepository, cardRepository) {
    super(gameRepository)
    this.gamePlayerRepository = gamePlayerRepository
    this.gameCardRepository = gameCardRepository
    this.cardRepository = cardRepository
  }

  /**
   * Distributes cards to players using recursive logic
   * @param {Array<string>} players - Array of player names
   * @param {number} cardsPerPlayer - Number of cards to deal to each player
   * @returns {Result} - Result containing the distributed cards
   */
  async distributeCards(players, cardsPerPlayer = 7) {
    return Result.fromAsync(async () => {
      // Validate input
      if (!Array.isArray(players) || players.length === 0) {
        throw new Error('Players array is required and cannot be empty')
      }

      if (cardsPerPlayer < 1 || cardsPerPlayer > 20) {
        throw new Error('Cards per player must be between 1 and 20')
      }

      // Generate and shuffle deck
      const deck = this.generateDeck()
      const shuffledDeck = this.shuffleDeck([...deck])

      // Check if we have enough cards
      const totalCardsNeeded = players.length * cardsPerPlayer
      if (shuffledDeck.length < totalCardsNeeded) {
        throw new Error(`Not enough cards in deck. Need ${totalCardsNeeded}, have ${shuffledDeck.length}`)
      }

      // Initialize player hands
      const playerHands = {}
      players.forEach(player => {
        playerHands[player] = []
      })

      // Distribute cards recursively
      this.dealCardsRecursively(shuffledDeck, players, playerHands, cardsPerPlayer, 0, 0)

      return {
        message: 'Cards dealt successfully.',
        players: playerHands
      }
    })
  }

  /**
   * Recursive function to deal cards to players
   * @param {Array<string>} deck - The shuffled deck
   * @param {Array<string>} players - Array of player names
   * @param {Object} playerHands - Object to store player hands
   * @param {number} cardsPerPlayer - Cards to deal per player
   * @param {number} currentPlayer - Current player index
   * @param {number} cardsDealt - Cards dealt to current player
   */
  dealCardsRecursively(deck, players, playerHands, cardsPerPlayer, currentPlayer, cardsDealt) {
    // Base case: all players have received all their cards
    if (currentPlayer >= players.length) {
      return
    }

    // Base case: current player has received all their cards
    if (cardsDealt >= cardsPerPlayer) {
      // Move to next player
      this.dealCardsRecursively(deck, players, playerHands, cardsPerPlayer, currentPlayer + 1, 0)
      return
    }

    // Deal one card to current player
    const card = deck.pop()
    if (card) {
      playerHands[players[currentPlayer]].push(card)

      // Recursive call: deal next card to current player
      this.dealCardsRecursively(deck, players, playerHands, cardsPerPlayer, currentPlayer, cardsDealt + 1)
    }
  }

  /**
   * Distributes cards to players in a game and persists to database
   * @param {number} gameId - The game ID
   * @param {Array<string>} players - Array of player names
   * @param {number} cardsPerPlayer - Number of cards to deal to each player
   * @returns {Result} - Result containing the distributed cards
   */
  async distributeCardsToGame(gameId, players, cardsPerPlayer = 7) {
    return Result.fromAsync(async () => {
      // First distribute cards logically
      const distributionResult = await this.distributeCards(players, cardsPerPlayer)
      if (!distributionResult.isSuccess) {
        throw new Error(distributionResult.error)
      }

      const { players: playerHands } = distributionResult.value

      // Get or create game players in database
      const gamePlayersMap = new Map()
      for (let i = 0; i < players.length; i++) {
        const playerName = players[i]

        // For now, we'll create a simple mapping - in a real implementation,
        // you'd want to link this to actual User entities
        let gamePlayer = await this.gamePlayerRepository.findBy({
          gameId: gameId,
          // This would need to be adjusted based on your User entity relationship
        })

        if (!gamePlayer.isSuccess || !gamePlayer.value) {
          // Create game player if doesn't exist
          const createResult = await this.gamePlayerRepository.create({
            gameId: gameId,
            userId: i + 1, // Temporary - should be actual user ID
            position: i,
            cardsCount: cardsPerPlayer,
            isReady: true
          })

          if (!createResult.isSuccess) {
            throw new Error(`Failed to create game player for ${playerName}`)
          }
          gamePlayersMap.set(playerName, createResult.value)
        } else {
          gamePlayersMap.set(playerName, gamePlayer.value)
        }
      }

      // Create card records in database
      const allCards = await this.cardRepository.findAll()
      if (!allCards.isSuccess) {
        throw new Error('Failed to load card definitions')
      }

      const cardDefinitions = allCards.value
      const cardMap = new Map()
      cardDefinitions.forEach(card => {
        const cardName = this.getCardDisplayName(card)
        cardMap.set(cardName, card)
      })

      // Create GameCard records for each dealt card
      for (const [playerName, cards] of Object.entries(playerHands)) {
        const gamePlayer = gamePlayersMap.get(playerName)

        for (let position = 0; position < cards.length; position++) {
          const cardName = cards[position]
          const cardDefinition = cardMap.get(cardName)

          if (cardDefinition) {
            await this.gameCardRepository.create({
              gameId: gameId,
              cardId: cardDefinition.id,
              playerId: gamePlayer.id,
              location: 'hand',
              position: position
            })
          }
        }
      }

      return distributionResult.value
    })
  }

  /**
   * Generates a standard UNO deck
   * @returns {Array<string>} - Array of card names
   */
  generateDeck() {
    const colors = ['Red', 'Blue', 'Green', 'Yellow']
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const specials = ['Skip', 'Reverse', 'Draw Two']

    let deck = []

    // Number and special cards for each color
    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push(`${color} ${number}`)
        // Add second copy of non-zero numbers
        if (number !== 0) deck.push(`${color} ${number}`)
      })

      specials.forEach(special => {
        deck.push(`${color} ${special}`)
        deck.push(`${color} ${special}`)
      })
    })

    // Wild cards
    for (let i = 0; i < 4; i++) {
      deck.push('Wild')
      deck.push('Wild Draw Four')
    }

    return deck
  }

  /**
   * Shuffles a deck using Fisher-Yates algorithm
   * @param {Array} deck - The deck to shuffle
   * @returns {Array} - The shuffled deck
   */
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
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
}

module.exports = CardDistributionService
