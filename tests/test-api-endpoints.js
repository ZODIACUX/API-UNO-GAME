const axios = require('axios')
require('dotenv').config()

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'
let authToken = ''
let testUserId = ''
let testGameId = ''

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(endpoint, method, status) {
  const statusColor = status === 'PASS' ? 'green' : 'red'
  log(`[${status}] ${method} ${endpoint}`, statusColor)
}

async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    }

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }

    if (data) {
      config.data = data
      config.headers['Content-Type'] = 'application/json'
    }

    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    }
  }
}

async function testHealthEndpoint() {
  log('\n=== TESTING HEALTH ENDPOINT ===', 'cyan')

  const result = await makeRequest('GET', '/../health')
  if (result.success) {
    logTest('/health', 'GET', 'PASS')
    log(`Response: ${JSON.stringify(result.data)}`, 'blue')
  } else {
    logTest('/health', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(result.error)}`, 'red')
  }
}

async function testRootEndpoint() {
  log('\n=== TESTING ROOT ENDPOINT ===', 'cyan')

  const result = await makeRequest('GET', '/')
  if (result.success) {
    logTest('/', 'GET', 'PASS')
    log(`Available endpoints: ${result.data.availableEndpoints?.length || 0}`, 'blue')
  } else {
    logTest('/', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(result.error)}`, 'red')
  }
}

async function testAuthEndpoints() {
  log('\n=== TESTING AUTH ENDPOINTS ===', 'cyan')

  // Test user registration
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123'
  }

  const registerResult = await makeRequest('POST', '/auth/register', registerData)
  if (registerResult.success) {
    logTest('/auth/register', 'POST', 'PASS')
    testUserId = registerResult.data.userId || 1
  } else {
    logTest('/auth/register', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(registerResult.error)}`, 'red')
  }

  // Test user login
  const loginData = {
    username: registerData.username,
    password: registerData.password
  }

  const loginResult = await makeRequest('POST', '/auth/login', loginData)
  if (loginResult.success) {
    logTest('/auth/login', 'POST', 'PASS')
    authToken = loginResult.data.access_token
    log(`Token obtained: ${authToken ? 'YES' : 'NO'}`, 'blue')
  } else {
    logTest('/auth/login', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(loginResult.error)}`, 'red')
  }

  // Test get profile (requires auth)
  const profileResult = await makeRequest('GET', '/auth/profile', null, true)
  if (profileResult.success) {
    logTest('/auth/profile', 'GET', 'PASS')
  } else {
    logTest('/auth/profile', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(profileResult.error)}`, 'red')
  }

  // Test logout
  const logoutResult = await makeRequest('POST', '/auth/logout', null, true)
  if (logoutResult.success) {
    logTest('/auth/logout', 'POST', 'PASS')
  } else {
    logTest('/auth/logout', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(logoutResult.error)}`, 'red')
  }
}

async function testCardEndpoints() {
  log('\n=== TESTING CARD ENDPOINTS ===', 'cyan')

  // Get all cards
  const getAllResult = await makeRequest('GET', '/cards', null, true)
  if (getAllResult.success) {
    logTest('/cards', 'GET', 'PASS')
    log(`Cards found: ${getAllResult.data.length || 0}`, 'blue')
  } else {
    logTest('/cards', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(getAllResult.error)}`, 'red')
  }

  // Create a new card
  const cardData = {
    type: 'NUMBER',
    color: 'RED',
    value: '5'
  }

  const createResult = await makeRequest('POST', '/cards', cardData, true)
  if (createResult.success) {
    logTest('/cards', 'POST', 'PASS')
  } else {
    logTest('/cards', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(createResult.error)}`, 'red')
  }

  // Get cards by type
  const typeResult = await makeRequest('GET', '/cards/type/NUMBER', null, true)
  if (typeResult.success) {
    logTest('/cards/type/:type', 'GET', 'PASS')
  } else {
    logTest('/cards/type/:type', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(typeResult.error)}`, 'red')
  }

  // Get cards by color
  const colorResult = await makeRequest('GET', '/cards/color/RED', null, true)
  if (colorResult.success) {
    logTest('/cards/color/:color', 'GET', 'PASS')
  } else {
    logTest('/cards/color/:color', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(colorResult.error)}`, 'red')
  }
}

async function testUnoGameEndpoints() {
  log('\n=== TESTING UNO GAME ENDPOINTS ===', 'cyan')

  // Get all games
  const getAllResult = await makeRequest('GET', '/uno-games/games', null, true)
  if (getAllResult.success) {
    logTest('/uno-games/games', 'GET', 'PASS')
  } else {
    logTest('/uno-games/games', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(getAllResult.error)}`, 'red')
  }

  // Create a new game
  const gameData = {
    name: `Test Game ${Date.now()}`,
    maxPlayers: 4
  }

  const createResult = await makeRequest('POST', '/uno-games/games', gameData, true)
  if (createResult.success) {
    logTest('/uno-games/games', 'POST', 'PASS')
    testGameId = createResult.data.id || 1
  } else {
    logTest('/uno-games/games', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(createResult.error)}`, 'red')
  }

  // Get active games
  const activeResult = await makeRequest('GET', '/uno-games/games/active', null, true)
  if (activeResult.success) {
    logTest('/uno-games/games/active', 'GET', 'PASS')
  } else {
    logTest('/uno-games/games/active', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(activeResult.error)}`, 'red')
  }

  // Get specific game
  if (testGameId) {
    const getResult = await makeRequest('GET', `/uno-games/games/${testGameId}`, null, true)
    if (getResult.success) {
      logTest('/uno-games/games/:id', 'GET', 'PASS')
    } else {
      logTest('/uno-games/games/:id', 'GET', 'FAIL')
      log(`Error: ${JSON.stringify(getResult.error)}`, 'red')
    }
  }
}

async function testGamePlayerEndpoints() {
  log('\n=== TESTING GAME PLAYER ENDPOINTS ===', 'cyan')

  if (!testGameId) {
    log('Skipping game player tests - no test game available', 'yellow')
    return
  }

  // Join game
  const joinResult = await makeRequest('POST', `/game-players/${testGameId}/join`, null, true)
  if (joinResult.success) {
    logTest('/game-players/:gameId/join', 'POST', 'PASS')
  } else {
    logTest('/game-players/:gameId/join', 'POST', 'FAIL')
    log(`Error: ${JSON.stringify(joinResult.error)}`, 'red')
  }

  // Get game players
  const playersResult = await makeRequest('GET', `/game-players/${testGameId}/players`, null, true)
  if (playersResult.success) {
    logTest('/game-players/:gameId/players', 'GET', 'PASS')
  } else {
    logTest('/game-players/:gameId/players', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(playersResult.error)}`, 'red')
  }
}

async function testParticipantEndpoints() {
  log('\n=== TESTING PARTICIPANT ENDPOINTS ===', 'cyan')

  // Get leaderboard
  const leaderboardResult = await makeRequest('GET', '/participants/leaderboard')
  if (leaderboardResult.success) {
    logTest('/participants/leaderboard', 'GET', 'PASS')
  } else {
    logTest('/participants/leaderboard', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(leaderboardResult.error)}`, 'red')
  }

  if (testUserId) {
    // Get participant stats
    const statsResult = await makeRequest('GET', `/participants/participants/${testUserId}/stats`)
    if (statsResult.success) {
      logTest('/participants/participants/:userId/stats', 'GET', 'PASS')
    } else {
      logTest('/participants/participants/:userId/stats', 'GET', 'FAIL')
      log(`Error: ${JSON.stringify(statsResult.error)}`, 'red')
    }
  }
}

async function testScoreEndpoints() {
  log('\n=== TESTING SCORE ENDPOINTS ===', 'cyan')

  // Get high scores
  const highScoresResult = await makeRequest('GET', '/scores/scores/high-scores')
  if (highScoresResult.success) {
    logTest('/scores/scores/high-scores', 'GET', 'PASS')
  } else {
    logTest('/scores/scores/high-scores', 'GET', 'FAIL')
    log(`Error: ${JSON.stringify(highScoresResult.error)}`, 'red')
  }

  if (testGameId) {
    // Get game scores
    const gameScoresResult = await makeRequest('GET', `/scores/games/${testGameId}/scores`)
    if (gameScoresResult.success) {
      logTest('/scores/games/:gameId/scores', 'GET', 'PASS')
    } else {
      logTest('/scores/games/:gameId/scores', 'GET', 'FAIL')
      log(`Error: ${JSON.stringify(gameScoresResult.error)}`, 'red')
    }
  }
}

async function runAllTests() {
  log('🚀 STARTING API ENDPOINT TESTS', 'cyan')
  log(`Base URL: ${BASE_URL}`, 'blue')
  log('=' * 50, 'cyan')

  try {
    await testHealthEndpoint()
    await testRootEndpoint()
    await testAuthEndpoints()
    await testCardEndpoints()
    await testUnoGameEndpoints()
    await testGamePlayerEndpoints()
    await testParticipantEndpoints()
    await testScoreEndpoints()

    log('\n🎉 ALL TESTS COMPLETED!', 'green')
    log('Check the results above for any failed endpoints.', 'blue')
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
}

module.exports = { runAllTests }
