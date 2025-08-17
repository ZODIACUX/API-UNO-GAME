const express = require('express')
const router = express.Router()
const unoGameController = require('../controllers/unoGameController')
const { authenticateToken } = require('../middleware/auth')
const {
  validateCreateGame,
  validatePlayCard,
  validateGameId
} = require('../validation/unoGameValidation')

// Middleware de autenticación para todas las rutas
router.use(authenticateToken)

// GET /api/uno/games - Obtener todos los juegos
router.get('/games', unoGameController.getAllGames)

// GET /api/uno/games/active - Obtener juegos activos
router.get('/games/active', unoGameController.getActiveGames)

// GET /api/uno/games/:id - Obtener un juego específico
router.get('/games/:id', validateGameId, unoGameController.getGame)

// POST /api/uno/games - Crear un nuevo juego
router.post('/games', validateCreateGame, unoGameController.createGame)

// POST /api/uno/games/:id/start - Iniciar un juego
router.post('/games/:id/start', validateGameId, unoGameController.startGame)

// POST /api/uno/games/:id/play - Jugar una carta
router.post('/games/:id/play', [validateGameId, validatePlayCard], unoGameController.playCard)

// POST /api/uno/games/:id/draw - Robar una carta
router.post('/games/:id/draw', validateGameId, unoGameController.drawCard)

module.exports = router
