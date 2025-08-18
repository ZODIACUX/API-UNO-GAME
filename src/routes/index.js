const express = require('express')
const router = express.Router()

console.log('🔄 Loading API routes...')

// Import authentication routes (REQUIRED for Postman collection)
try {
  const authRoutes = require('./authRoutes')
  router.use('/auth', authRoutes)
  console.log('✅ Auth routes loaded successfully')
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message)
}

// Import game management routes (REQUIRED for Postman collection)
try {
  const gameRoutes = require('./gameRoutes')
  router.use('/game', gameRoutes)
  console.log('✅ Game routes loaded successfully')
} catch (error) {
  console.error('❌ Failed to load game routes:', error.message)
}

// Import additional TypeORM routes
try {
  const gameParticipantRoutes = require('./gameParticipantRoutes')
  const gameScoreRoutes = require('./gameScoreRoutes')
  const cardRoutes = require('./cardRoutes')
  const unoGameRoutes = require('./unoGameRoutes')
  const gamePlayerRoutes = require('./gamePlayerRoutes')

  // Configure additional routes
  router.use('/participants', gameParticipantRoutes)
  router.use('/scores', gameScoreRoutes)
  router.use('/cards', cardRoutes)
  router.use('/uno-games', unoGameRoutes)
  router.use('/game-players', gamePlayerRoutes)
  console.log('✅ Additional TypeORM routes loaded successfully')
} catch (error) {
  console.error('❌ Some TypeORM routes failed to load:', error.message)
}

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'UNO Game API - Complete Routes',
    availableEndpoints: [
      // Authentication endpoints
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      // Game management endpoints
      'POST /api/game/create',
      'POST /api/game/join',
      'POST /api/game/start',
      'POST /api/game/leave',
      'POST /api/game/end',
      'GET /api/game/:id/state',
      'GET /api/game/:id/players',
      'GET /api/game/:id/current-player',
      'GET /api/game/:id/top-card',
      'GET /api/game/:id/scores',
      // Additional endpoints
      'GET /api/participants',
      'GET /api/scores',
      'GET /api/cards',
      'GET /api/uno-games',
      'GET /api/game-players'
    ]
  })
})

console.log('🚀 All API routes configured')
module.exports = router
