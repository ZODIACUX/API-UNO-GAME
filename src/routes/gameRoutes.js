const express = require('express')
const router = express.Router()
const gameController = require('../controllers/GameController')
const { authenticateToken } = require('../middlewares/auth')
const {
  createGameSchema,
  joinGameSchema,
  gameActionSchema,
  validateRequest
} = require('../middlewares/gameValidation')

router.post('/create', authenticateToken, validateRequest(createGameSchema), gameController.createGame)
router.post('/join', authenticateToken, validateRequest(joinGameSchema), gameController.joinGame)
router.post('/start', authenticateToken, validateRequest(gameActionSchema), gameController.startGame)
router.post('/leave', authenticateToken, validateRequest(gameActionSchema), gameController.leaveGame)
router.post('/end', authenticateToken, validateRequest(gameActionSchema), gameController.endGame)
router.get('/:game_id/state', gameController.getGameState)
router.get('/:game_id/players', gameController.getGamePlayers)
router.get('/:game_id/current-player', gameController.getCurrentPlayer)
router.get('/:game_id/top-card', gameController.getTopCard)
router.get('/:game_id/scores', gameController.getScores)

module.exports = router
