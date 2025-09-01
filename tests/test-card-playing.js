const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

// Test data
const testUser1 = {
  username: 'testplayer1',
  email: 'testplayer1@example.com',
  password: 'password123'
}

const testUser2 = {
  username: 'testplayer2',
  email: 'testplayer2@example.com',
  password: 'password123'
}

let user1Token = ''
let user2Token = ''
let gameId = null

async function testCardPlayingSystem() {
  console.log('🎮 Testing UNO Card Playing System...\n')

  try {
    // Step 1: Register and login users
    console.log('1. Setting up test users...')
    await registerUser(testUser1)
    await registerUser(testUser2)
    
    user1Token = await loginUser(testUser1.username, testUser1.password)
    user2Token = await loginUser(testUser2.username, testUser2.password)
    console.log('✅ Users registered and logged in\n')

    // Step 2: Create and start game
    console.log('2. Creating and starting game...')
    gameId = await createGame(user1Token, 'Test Card Playing Game')
    await joinGame(user2Token, gameId)
    await startGame(user1Token, gameId)
    console.log('✅ Game created and started\n')

    // Step 3: Deal cards to players
    console.log('3. Dealing cards to players...')
    const dealResult = await dealCards(['testplayer1', 'testplayer2'], 7)
    console.log('✅ Cards dealt successfully')
    console.log('Player hands:', JSON.stringify(dealResult.players, null, 2))
    console.log()

    // Step 4: Get current game state
    console.log('4. Getting current game state...')
    const gameState = await getGameState(gameId)
    const currentPlayer = await getCurrentPlayer(gameId)
    const topCard = await getTopCard(gameId)
    
    console.log('Game state:', gameState.state)
    console.log('Current player:', currentPlayer.current_player)
    console.log('Top card:', topCard.top_card)
    console.log()

    // Step 5: Test card playing
    console.log('5. Testing card playing...')
    
    // Try to play a valid card
    const playerHand = dealResult.players['testplayer1']
    console.log('Player 1 hand:', playerHand)
    
    // Find a card that can be played (for testing, we'll try the first card)
    const cardToPlay = playerHand[0]
    console.log(`Attempting to play card: ${cardToPlay}`)
    
    try {
      const playResult = await playCard(user1Token, 'testplayer1', cardToPlay)
      console.log('✅ Card played successfully!')
      console.log('Next player:', playResult.nextPlayer)
    } catch (error) {
      console.log('❌ Card play failed (expected for invalid card):', error.response?.data?.message || error.message)
      
      // Try playing a different card or a wild card
      console.log('Trying to play a Wild card...')
      try {
        const wildPlayResult = await playCard(user1Token, 'testplayer1', 'Wild', 'Red')
        console.log('✅ Wild card played successfully!')
        console.log('Next player:', wildPlayResult.nextPlayer)
      } catch (wildError) {
        console.log('❌ Wild card play also failed:', wildError.response?.data?.message || wildError.message)
      }
    }

    // Step 6: Test invalid card play
    console.log('\n6. Testing invalid card play...')
    try {
      await playCard(user2Token, 'testplayer2', 'Blue 5') // Wrong player's turn
      console.log('❌ Should have failed - wrong player turn')
    } catch (error) {
      console.log('✅ Correctly rejected wrong player turn:', error.response?.data?.message)
    }

    console.log('\n🎉 Card playing system test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

// Helper functions
async function registerUser(userData) {
  try {
    await axios.post(`${BASE_URL}/register`, userData)
  } catch (error) {
    if (error.response?.status !== 400) { // Ignore "user already exists"
      throw error
    }
  }
}

async function loginUser(username, password) {
  const response = await axios.post(`${BASE_URL}/login`, { username, password })
  return response.data.access_token
}

async function createGame(token, gameName) {
  const response = await axios.post(`${BASE_URL}/game/create`, 
    { name: gameName },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data.game_id
}

async function joinGame(token, gameId) {
  await axios.post(`${BASE_URL}/game/join`, 
    { game_id: gameId },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}

async function startGame(token, gameId) {
  await axios.post(`${BASE_URL}/game/start`, 
    { game_id: gameId },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}

async function dealCards(players, cardsPerPlayer) {
  const response = await axios.post(`${BASE_URL}/cards/deal`, {
    players,
    cardsPerPlayer
  })
  return response.data
}

async function getGameState(gameId) {
  const response = await axios.post(`${BASE_URL}/game/state`, { game_id: gameId })
  return response.data
}

async function getCurrentPlayer(gameId) {
  const response = await axios.post(`${BASE_URL}/game/current-player`, { game_id: gameId })
  return response.data
}

async function getTopCard(gameId) {
  const response = await axios.post(`${BASE_URL}/game/top-card`, { game_id: gameId })
  return response.data
}

async function playCard(token, player, cardPlayed, targetColor = null) {
  const payload = { player, cardPlayed }
  if (targetColor) {
    payload.targetColor = targetColor
  }
  
  const response = await axios.put(`${BASE_URL}/cards/play`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Run the test
if (require.main === module) {
  testCardPlayingSystem()
}

module.exports = { testCardPlayingSystem }