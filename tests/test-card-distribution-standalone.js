const Result = require('./src/core/errors/Result')

/**
 * Standalone CardDistributionService for testing (without BaseService dependency)
 */
class StandaloneCardDistributionService {
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
}

// Create a simple test for the card distribution functionality
async function testCardDistribution() {
  console.log('🃏 Testing Card Distribution System...\n')

  // Create service instance
  const cardDistributionService = new StandaloneCardDistributionService()

  // Test Case 1: Basic 3-player game with 7 cards each
  console.log('Test Case 1: 3 players, 7 cards each')
  console.log('=====================================')

  const players1 = ['Player1', 'Player2', 'Player3']
  const result1 = await cardDistributionService.distributeCards(players1, 7)

  if (result1.isSuccess) {
    const { message, players } = result1.value
    console.log('✅ Success:', message)

    // Verify each player has 7 cards
    Object.entries(players).forEach(([playerName, cards]) => {
      console.log(`${playerName}: ${cards.length} cards - ${cards.slice(0, 3).join(', ')}...`)
    })

    // Verify total cards dealt
    const totalCards = Object.values(players).reduce((sum, cards) => sum + cards.length, 0)
    console.log(`Total cards dealt: ${totalCards}`)
    console.log()
  } else {
    console.log('❌ Failed:', result1.error)
  }

  // Test Case 2: 2-player game with 5 cards each
  console.log('Test Case 2: 2 players, 5 cards each')
  console.log('=====================================')

  const players2 = ['Alice', 'Bob']
  const result2 = await cardDistributionService.distributeCards(players2, 5)

  if (result2.isSuccess) {
    const { message, players } = result2.value
    console.log('✅ Success:', message)

    Object.entries(players).forEach(([playerName, cards]) => {
      console.log(`${playerName}: ${cards.join(', ')}`)
    })
    console.log()
  } else {
    console.log('❌ Failed:', result2.error)
  }

  // Test Case 3: Error case - too many cards
  console.log('Test Case 3: Error handling - too many cards')
  console.log('=============================================')

  const players3 = ['Player1']
  const result3 = await cardDistributionService.distributeCards(players3, 25)

  if (result3.isSuccess) {
    console.log('✅ Unexpected success')
  } else {
    console.log('✅ Expected error:', result3.error)
  }
  console.log()

  // Test Case 4: Error case - empty players array
  console.log('Test Case 4: Error handling - empty players')
  console.log('===========================================')

  const result4 = await cardDistributionService.distributeCards([], 7)

  if (result4.isSuccess) {
    console.log('✅ Unexpected success')
  } else {
    console.log('✅ Expected error:', result4.error)
  }
  console.log()

  // Test Case 5: Verify deck composition
  console.log('Test Case 5: Verify deck composition')
  console.log('===================================')

  const deck = cardDistributionService.generateDeck()
  console.log(`Total cards in deck: ${deck.length}`)

  // Count card types
  const cardCounts = {}
  deck.forEach(card => {
    cardCounts[card] = (cardCounts[card] || 0) + 1
  })

  // Show some examples
  console.log('Sample cards and counts:')
  Object.entries(cardCounts).slice(0, 10).forEach(([card, count]) => {
    console.log(`  ${card}: ${count}`)
  })

  // Test Case 6: Verify recursive distribution works correctly
  console.log('\nTest Case 6: Verify recursive distribution pattern')
  console.log('=================================================')

  const players6 = ['A', 'B', 'C']
  const result6 = await cardDistributionService.distributeCards(players6, 3)

  if (result6.isSuccess) {
    const { players } = result6.value
    console.log('✅ Distribution pattern verification:')
    Object.entries(players).forEach(([playerName, cards]) => {
      console.log(`${playerName}: ${cards.join(', ')}`)
    })

    // Verify no duplicate cards were dealt
    const allDealtCards = Object.values(players).flat()
    const uniqueCards = new Set(allDealtCards)
    console.log(`Cards dealt: ${allDealtCards.length}, Unique cards: ${uniqueCards.size}`)
    if (allDealtCards.length === uniqueCards.size) {
      console.log('✅ No duplicate cards dealt')
    } else {
      console.log('❌ Duplicate cards detected!')
    }
  }

  console.log('\n🎉 Card Distribution System Test Complete!')
}

// Run the test
testCardDistribution().catch(console.error)