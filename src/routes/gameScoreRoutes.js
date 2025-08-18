const express = require('express')
const router = express.Router()
const gameScoreController = require('../controllers/gameScoreController')
const { authenticateToken } = require('../middleware/auth')
const { validateScoreData, validateScoreParams } = require('../validation/gameScoreValidation')

router.post('/games/:gameId/scores', authenticateToken, validateScoreData, gameScoreController.createScore)
router.put('/scores/:id', authenticateToken, validateScoreData, gameScoreController.updateScore)
router.get('/games/:gameId/scores', validateScoreParams, gameScoreController.getGameScores)
router.get('/participants/:participantId/scores', validateScoreParams, gameScoreController.getParticipantScores)
router.get('/scores/high-scores', gameScoreController.getHighScores)
router.post('/games/:gameId/calculate-scores', authenticateToken, validateScoreData, gameScoreController.calculateFinalScores)

module.exports = router
