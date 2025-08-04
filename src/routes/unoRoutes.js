const { Router } = require('express');
const { UnoController } = require('../controllers/UnoController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
  createUnoGameSchema,
  joinGameSchema,
  gameActionSchema,
  gameIdSchema
} = require('../validation/unoSchemas');

const router = Router();
const unoController = new UnoController();

// 1. Registrar usuario
router.post('/register', validateRequest(registerUserSchema), unoController.registerUser);

// 2. Iniciar sesión
router.post('/login', validateRequest(loginUserSchema), unoController.loginUser);

// 3. Cerrar sesión
router.post('/logout', validateRequest(logoutUserSchema), unoController.logoutUser);

// 4. Obtener perfil (requiere autenticación)
router.get('/profile', authenticateToken, unoController.getUserProfile);
router.post('/profile', authenticateToken, unoController.getUserProfile); // Para compatibilidad con body

// 5. Crear juego (requiere autenticación)
router.post('/game/create', authenticateToken, unoController.createGame);

// 6. Unirse a juego (requiere autenticación)
router.post('/game/join', authenticateToken, validateRequest(joinGameSchema), unoController.joinGame);

// 7. Iniciar juego (requiere autenticación)
router.post('/game/start', authenticateToken, validateRequest(gameActionSchema), unoController.startGame);

// 8. Abandonar juego (requiere autenticación)
router.post('/game/leave', authenticateToken, validateRequest(gameActionSchema), unoController.leaveGame);

// 9. Finalizar juego (requiere autenticación)
router.post('/game/end', authenticateToken, validateRequest(gameActionSchema), unoController.endGame);

// 10. Obtener estado del juego
router.post('/game/state', validateRequest(gameIdSchema), unoController.getGameState);

// 11. Obtener jugadores del juego
router.post('/game/players', validateRequest(gameIdSchema), unoController.getGamePlayers);

// 12. Obtener jugador actual
router.post('/game/current-player', validateRequest(gameIdSchema), unoController.getCurrentPlayer);

// 13. Obtener carta superior
router.post('/game/top-card', validateRequest(gameIdSchema), unoController.getTopCard);

// 14. Obtener puntuaciones
router.post('/game/scores', validateRequest(gameIdSchema), unoController.getScores);

module.exports = router;