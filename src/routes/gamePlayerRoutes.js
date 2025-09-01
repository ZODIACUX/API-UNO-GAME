const express = require('express')
const router = express.Router()
const gamePlayerController = require('../controllers/gamePlayerController')
const { authenticateToken } = require('../middlewares/auth')
const { validateGameId, validateReadyStatus } = require('../middlewares/gameValidation')

// Middleware de autenticación para todas las rutas
router.use(authenticateToken)

// GET /api/games/:gameId/players - Obtener todos los jugadores de un juego
router.get('/:gameId/players', validateGameId, gamePlayerController.getGamePlayers)

// POST /api/games/:gameId/join - Unirse a un juego
router.post('/:gameId/join', validateGameId, gamePlayerController.joinGame)

// POST /api/games/:gameId/leave - Salir de un juego
router.post('/:gameId/leave', validateGameId, gamePlayerController.leaveGame)

// PUT /api/games/:gameId/ready - Marcar como listo para jugar
router.put('/:gameId/ready', validateGameId, validateReadyStatus, gamePlayerController.setReady)

module.exports = router
