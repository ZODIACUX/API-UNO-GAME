const express = require('express')
const router = express.Router()

// Import SOLID-compliant services and controllers
const ServiceRegistration = require('../core/di/ServiceRegistration')

// Initialize services
ServiceRegistration.registerServices()

// Get controllers from dependency injection container
const unoGameController = ServiceRegistration.getService('unoGameController')
const authController = ServiceRegistration.getService('authController')

// Import middleware
const auth = require('../middlewares/auth')

// Auth routes
router.post('/register', authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', auth.verifyToken, authController.logout.bind(authController))
router.get('/profile', auth.verifyToken, authController.getProfile.bind(authController))

// Game routes
router.post('/games', auth.verifyToken, unoGameController.createGame.bind(unoGameController))
router.post('/games/:gameId/join', auth.verifyToken, unoGameController.joinGame.bind(unoGameController))
router.post('/games/:gameId/start', auth.verifyToken, unoGameController.startGame.bind(unoGameController))
router.post('/games/:gameId/leave', auth.verifyToken, unoGameController.leaveGame.bind(unoGameController))
router.post('/games/:gameId/end', auth.verifyToken, unoGameController.endGame.bind(unoGameController))

// Game state routes
router.get('/games/:gameId/state', auth.verifyToken, unoGameController.getGameState.bind(unoGameController))
router.get('/games/:gameId/players', auth.verifyToken, unoGameController.getGamePlayers.bind(unoGameController))
router.get('/games/:gameId/current-player', auth.verifyToken, unoGameController.getCurrentPlayer.bind(unoGameController))
router.get('/games/:gameId/top-card', auth.verifyToken, unoGameController.getTopCard.bind(unoGameController))
router.get('/games/:gameId/scores', auth.verifyToken, unoGameController.getScores.bind(unoGameController))

// Game action routes
router.post('/games/next-turn', auth.verifyToken, unoGameController.nextTurn.bind(unoGameController))
router.post('/games/:gameId/play-card', auth.verifyToken, unoGameController.playCard.bind(unoGameController))
router.post('/games/:gameId/draw-card', auth.verifyToken, unoGameController.drawCard.bind(unoGameController))
router.post('/games/:gameId/say-uno', auth.verifyToken, unoGameController.sayUno.bind(unoGameController))
router.post('/games/:gameId/challenge-uno', auth.verifyToken, unoGameController.challengeUno.bind(unoGameController))

// Additional game routes
router.get('/games/:gameId/hand', auth.verifyToken, unoGameController.getPlayerHand.bind(unoGameController))
router.get('/games/:gameId/history', auth.verifyToken, unoGameController.getGameHistory.bind(unoGameController))
router.get('/games/:gameId/details', auth.verifyToken, unoGameController.getGameDetails.bind(unoGameController))

module.exports = router
