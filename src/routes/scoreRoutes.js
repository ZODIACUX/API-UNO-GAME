const { Router } = require('express');
const { ScoreController } = require('../controllers/ScoreController');
const { validateRequest, validateUUID } = require('../middleware/validation');
const { createScoreSchema, updateScoreSchema } = require('../validation/scoreSchemas');

const router = Router();
const scoreController = new ScoreController();

// POST /api/scores - Crear score
router.post('/', validateRequest(createScoreSchema), scoreController.createScore);

// GET /api/scores - Obtener todos los scores
router.get('/', scoreController.getAllScores);

// GET /api/scores/top - Obtener top scores
router.get('/top', scoreController.getTopScores);

// GET /api/scores/:id - Obtener score por ID
router.get('/:id', validateUUID, scoreController.getScoreById);

// PUT /api/scores/:id - Actualizar score
router.put('/:id', validateUUID, validateRequest(updateScoreSchema), scoreController.updateScore);

// DELETE /api/scores/:id - Eliminar score
router.delete('/:id', validateUUID, scoreController.deleteScore);

module.exports = router;