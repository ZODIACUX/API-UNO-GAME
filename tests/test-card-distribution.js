const CardDistributionService = require('./src/core/services/CardDistributionService')

// Create a simple test for the card distribution functionality
async function testCardDistribution() {
  console.log('🃏 Testing Card Distribution System...\n')

  // Create service instance (without database dependencies for testing)
  const cardDistributionService = new CardDistributionService(null, null, null, null)

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
  
  console.log('\n🎉 Card Distribution System Test Complete!')
}

// Run the test
testCardDistribution().catch(console.error)