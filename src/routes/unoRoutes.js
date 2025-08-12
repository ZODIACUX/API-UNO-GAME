const { Router } = require('express')
const { UnoController } = require('../controllers/UnoController')
const { authenticateToken } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  profileSchema,
  createGameSchema,
  gameActionSchema,
  gameIdOnlySchema
} = require('../validation/unoSchemas')

const router = Router()
const unoController = new UnoController()

// 1. Registrar usuario
router.post('/register', validateRequest(registerUserSchema), unoController.registerUser)

// 2. Iniciar sesión
router.post('/login', validateRequest(loginUserSchema), unoController.loginUser)

// 3. Cerrar sesión
router.post('/logout', validateRequest(logoutUserSchema), unoController.logoutUser)

// 4. Obtener perfil (requiere autenticación)
router.post('/profile', authenticateToken, unoController.getUserProfile)

// 5. Crear juego (requiere autenticación)
router.post('/game/create', authenticateToken, unoController.createGame)

// 6. Unirse a juego (requiere autenticación)
router.post('/game/join', authenticateToken, validateRequest(gameActionSchema), unoController.joinGame)

// 7. Iniciar juego (requiere autenticación)
router.post('/game/start', authenticateToken, validateRequest(gameActionSchema), unoController.startGame)

// 8. Abandonar juego (requiere autenticación)
router.post('/game/leave', authenticateToken, validateRequest(gameActionSchema), unoController.leaveGame)

// 9. Finalizar juego (requiere autenticación)
router.post('/game/end', authenticateToken, validateRequest(gameActionSchema), unoController.endGame)

// 10. Obtener estado del juego (NO requiere autenticación según spec)
router.post('/game/state', validateRequest(gameIdOnlySchema), unoController.getGameState)

// 11. Obtener jugadores del juego (NO requiere autenticación según spec)
router.post('/game/players', validateRequest(gameIdOnlySchema), unoController.getGamePlayers)

// 12. Obtener jugador actual (NO requiere autenticación según spec)
router.post('/game/current-player', validateRequest(gameIdOnlySchema), unoController.getCurrentPlayer)

// 13. Obtener carta superior (NO requiere autenticación según spec)
router.post('/game/top-card', validateRequest(gameIdOnlySchema), unoController.getTopCard)

// 14. Obtener puntuaciones (NO requiere autenticación según spec)
router.post('/game/scores', validateRequest(gameIdOnlySchema), unoController.getScores)

module.exports = router
