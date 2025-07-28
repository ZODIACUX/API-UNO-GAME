const { Router } = require('express');
const { PlayerController } = require('../controllers/PlayerController');
const { validateRequest, validateUUID } = require('../middleware/validation');
const { createPlayerSchema, updatePlayerSchema } = require('../validation/playerSchemas');

const router = Router();
const playerController = new PlayerController();

// POST /api/players - Crear jugador
router.post('/', validateRequest(createPlayerSchema), playerController.createPlayer);

// GET /api/players - Obtener todos los jugadores
router.get('/', playerController.getAllPlayers);

// GET /api/players/top - Obtener top jugadores
router.get('/top', playerController.getTopPlayers);

// GET /api/players/:id - Obtener jugador por ID
router.get('/:id', validateUUID, playerController.getPlayerById);

// PUT /api/players/:id - Actualizar jugador
router.put('/:id', validateUUID, validateRequest(updatePlayerSchema), playerController.updatePlayer);

// DELETE /api/players/:id - Eliminar jugador
router.delete('/:id', validateUUID, playerController.deletePlayer);

module.exports = router;
