const express = require('express')
const router = express.Router()

// Importar solo las rutas TypeORM que funcionan
try {
  const gameParticipantRoutes = require('./gameParticipantRoutes')
  const gameScoreRoutes = require('./gameScoreRoutes')
  const cardRoutes = require('./cardRoutes')
  const unoGameRoutes = require('./unoGameRoutes')
  const gamePlayerRoutes = require('./gamePlayerRoutes')

  // Configurar rutas funcionales
  router.use('/participants', gameParticipantRoutes)
  router.use('/scores', gameScoreRoutes)
  router.use('/cards', cardRoutes)
  router.use('/uno-games', unoGameRoutes)
  router.use('/game-players', gamePlayerRoutes)
} catch (error) {
  console.log('Some routes failed to load:', error.message)
}

// Rutas básicas de prueba
router.get('/', (req, res) => {
  res.json({
    message: 'UNO Game API - Functional Routes',
    availableEndpoints: [
      'GET /api/participants',
      'GET /api/scores',
      'GET /api/cards',
      'GET /api/uno-games',
      'GET /api/game-players'
    ]
  })
})

module.exports = router
