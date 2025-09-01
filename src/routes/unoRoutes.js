const { Router } = require('express')
const { UnoController } = require('../controllers/UnoController')
const { authenticateToken } = require('../middleware/auth')
const {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  gameActionSchema,
  gameIdOnlySchema,
  cardDistributionSchema,
  cardPlaySchema,
  cardDrawSchema,
  unoCallSchema,
  unoChallengeSchema,
  validateRequest
} = require('../validation/unoSchemas')

const router = Router()
const unoController = new UnoController()

// 1. Registrar usuario
router.post('/register', validateRequest(registerUserSchema), (req, res) => unoController.registerUser(req, res))

// 2. Iniciar sesión
router.post('/login', validateRequest(loginUserSchema), (req, res) => unoController.loginUser(req, res))

// 3. Cerrar sesión
router.post('/logout', validateRequest(logoutUserSchema), (req, res) => unoController.logoutUser(req, res))

// 4. Obtener perfil (requiere autenticación)
router.post('/profile', authenticateToken, (req, res) => unoController.getUserProfile(req, res))

// 5. Crear juego (requiere autenticación)
router.post('/game/create', authenticateToken, (req, res) => unoController.createGame(req, res))

// 6. Unirse a juego (requiere autenticación)
router.post('/game/join', authenticateToken, validateRequest(gameActionSchema), (req, res) => unoController.joinGame(req, res))

// 7. Iniciar juego (requiere autenticación)
router.post('/game/start', authenticateToken, validateRequest(gameActionSchema), (req, res) => unoController.startGame(req, res))

// 8. Abandonar juego (requiere autenticación)
router.post('/game/leave', authenticateToken, validateRequest(gameActionSchema), (req, res) => unoController.leaveGame(req, res))

// 9. Finalizar juego (requiere autenticación)
router.post('/game/end', authenticateToken, validateRequest(gameActionSchema), (req, res) => unoController.endGame(req, res))

// 10. Obtener estado del juego (NO requiere autenticación según spec)
router.post('/game/state', validateRequest(gameIdOnlySchema), (req, res) => unoController.getGameState(req, res))

// 11. Obtener jugadores del juego (NO requiere autenticación según spec)
router.post('/game/players', validateRequest(gameIdOnlySchema), (req, res) => unoController.getGamePlayers(req, res))

// 12. Obtener jugador actual (NO requiere autenticación según spec)
router.post('/game/current-player', validateRequest(gameIdOnlySchema), (req, res) => unoController.getCurrentPlayer(req, res))

// 13. Obtener carta superior (NO requiere autenticación según spec)
router.post('/game/top-card', validateRequest(gameIdOnlySchema), (req, res) => unoController.getTopCard(req, res))

// 14. Obtener puntuaciones (NO requiere autenticación según spec)
router.post('/game/scores', validateRequest(gameIdOnlySchema), (req, res) => unoController.getScores(req, res))

// 15. Distribuir cartas (NUEVO - Requirement 1)
router.post('/cards/deal', validateRequest(cardDistributionSchema), (req, res) => unoController.dealCards(req, res))

// 16. Jugar carta (NUEVO - Requirement 2)
router.put('/cards/play', authenticateToken, validateRequest(cardPlaySchema), (req, res) => unoController.playCard(req, res))

// 17. Dibujar carta (NUEVO - Requirement 3)
router.put('/cards/draw', validateRequest(cardDrawSchema), (req, res) => unoController.drawCard(req, res))

// 18. Llamar UNO (NUEVO - Requirement 4)
router.patch('/uno/call', validateRequest(unoCallSchema), (req, res) => unoController.callUno(req, res))

// 19. Desafiar UNO (NUEVO - Requirement 5)
router.post('/uno/challenge', validateRequest(unoChallengeSchema), (req, res) => unoController.challengeUno(req, res))

module.exports = router
