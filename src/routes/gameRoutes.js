const { Router } = require('express');
const { GameController } = require('../controllers/GameController');
const { validateRequest, validateUUID } = require('../middleware/validation');
const { createGameSchema, updateGameSchema } = require('../validation/gameSchemas');

const router = Router();
const gameController = new GameController();

// POST /api/games - Crear juego
router.post('/', validateRequest(createGameSchema), gameController.createGame);

// GET /api/games - Obtener todos los juegos
router.get('/', gameController.getAllGames);

// GET /api/games/:id - Obtener juego por ID
router.get('/:id', validateUUID, gameController.getGameById);

// PUT /api/games/:id - Actualizar juego
router.put('/:id', validateUUID, validateRequest(updateGameSchema), gameController.updateGame);

// DELETE /api/games/:id - Eliminar juego
router.delete('/:id', validateUUID, gameController.deleteGame);

module.exports = router;
