const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testCardDrawing() {
  console.log('🃏 Testing Card Drawing Functionality (Requirement 3)')
  console.log('=' .repeat(60))

  try {
    // Test 1: Valid card draw request
    console.log('\n📋 Test 1: Valid card draw request')
    console.log('PUT /cards/draw')
    console.log('Body: { "player": "Player1" }')

    const drawResponse = await axios.put(`${BASE_URL}/cards/draw`, {
      player: 'Player1'
    })

    console.log('✅ Status:', drawResponse.status)
    console.log('✅ Response:', JSON.stringify(drawResponse.data, null, 2))

    // Verify response structure
    const expectedFields = ['message', 'cardDrawn']
    const hasAllFields = expectedFields.every(field =>
      Object.prototype.hasOwnProperty.call(drawResponse.data, field)
    )

    if (hasAllFields) {
      console.log('✅ Response has all required fields')
    } else {
      console.log('❌ Response missing required fields')
    }

    // Verify message format
    if (drawResponse.data.message && drawResponse.data.message.includes('drew a card from the deck')) {
      console.log('✅ Message format is correct')
    } else {
      console.log('❌ Message format is incorrect')
    }

    // Verify card drawn is a valid card name
    if (drawResponse.data.cardDrawn && typeof drawResponse.data.cardDrawn === 'string') {
      console.log('✅ Card drawn is a valid string')
    } else {
      console.log('❌ Card drawn is not a valid string')
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Status:', error.response.status)
      console.log('❌ Error:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('❌ Network Error:', error.message)
    }
  }

  try {
    // Test 2: Invalid request - missing player
    console.log('\n📋 Test 2: Invalid request - missing player')
    console.log('PUT /cards/draw')
    console.log('Body: {}')

    await axios.put(`${BASE_URL}/cards/draw`, {})

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Status:', error.response.status, '(Expected validation error)')
      console.log('✅ Error:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  try {
    // Test 3: Invalid request - empty player name
    console.log('\n📋 Test 3: Invalid request - empty player name')
    console.log('PUT /cards/draw')
    console.log('Body: { "player": "" }')

    await axios.put(`${BASE_URL}/cards/draw`, {
      player: ''
    })

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Status:', error.response.status, '(Expected validation error)')
      console.log('✅ Error:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  try {
    // Test 4: Test with different player names
    console.log('\n📋 Test 4: Test with different player names')
    const players = ['Player2', 'Alice', 'Bob']

    for (const player of players) {
      console.log(`\nTesting with player: ${player}`)
      console.log('PUT /cards/draw')
      console.log(`Body: { "player": "${player}" }`)
      
      const playerResponse = await axios.put(`${BASE_URL}/cards/draw`, {
        player: player
      })

      console.log('✅ Status:', playerResponse.status)
      console.log('✅ Response:', JSON.stringify(playerResponse.data, null, 2))
    }

  } catch (error) {
    if (error.response) {
      console.log('ℹ️  Status:', error.response.status)
      console.log('ℹ️  Response:', JSON.stringify(error.response.data, null, 2))
      console.log('ℹ️  This might be expected if no active game or player has valid cards')
    } else {
      console.log('❌ Network Error:', error.message)
    }
  }

  console.log('\n🏁 Card Drawing Tests Completed')
  console.log('=' .repeat(60))
}

// Run the tests
testCardDrawing().catch(console.error)
