const express = require('express')
const router = express.Router()
const gameParticipantController = require('../controllers/gameParticipantController')
const { authenticateToken } = require('../middlewares/auth')
const { validateParticipantParams } = require('../middlewares/gameParticipantValidation')

router.post('/games/:gameId/join', authenticateToken, validateParticipantParams, gameParticipantController.joinGame)
router.delete('/games/:gameId/leave', authenticateToken, validateParticipantParams, gameParticipantController.leaveGame)
router.get('/games/:gameId/participants', validateParticipantParams, gameParticipantController.getParticipants)
router.get('/participants/:userId/stats', validateParticipantParams, gameParticipantController.getParticipantStats)
router.get('/leaderboard', gameParticipantController.getLeaderboard)

module.exports = router
