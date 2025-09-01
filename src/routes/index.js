const express = require('express')
const router = express.Router()

// Importar rutas de autenticación
try {
  const authRoutes = require('./authRoutes')
  router.use('/auth', authRoutes)
  console.log('✓ Auth routes loaded successfully')
} catch (error) {
  console.log('✗ Auth routes failed to load:', error.message)
  console.log('Auth routes error stack:', error.stack)
}

// Importar solo las rutas TypeORM que funcionan
try {
  console.log('Loading individual route modules...')

  const gameParticipantRoutes = require('./gameParticipantRoutes')
  console.log('✓ gameParticipantRoutes loaded')

  const gameScoreRoutes = require('./gameScoreRoutes')
  console.log('✓ gameScoreRoutes loaded')

  const cardRoutes = require('./cardRoutes')
  console.log('✓ cardRoutes loaded')

  const unoGameRoutes = require('./unoGameRoutes')
  console.log('✓ unoGameRoutes loaded')

  const gamePlayerRoutes = require('./gamePlayerRoutes')
  console.log('✓ gamePlayerRoutes loaded')

  const unoRoutes = require('./unoRoutes')
  console.log('✓ unoRoutes loaded')

<<<<<<< Updated upstream
  // Configure additional routes
=======
  // Configurar rutas funcionales
>>>>>>> Stashed changes
  router.use('/participants', gameParticipantRoutes)
  router.use('/scores', gameScoreRoutes)
  router.use('/cards', cardRoutes)
  router.use('/uno-games', unoGameRoutes)
  router.use('/game-players', gamePlayerRoutes)
  router.use('/', unoRoutes)

  // Configure UNO API routes (main game endpoints)
  router.use('/', unoRoutes)
  console.log('✓ All route modules configured successfully')
} catch (error) {
  console.log('✗ Some routes failed to load:', error.message)
  console.log('Route loading error stack:', error.stack)
}

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'UNO Game API - Complete Routes',
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
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
