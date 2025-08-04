const { Router } = require('express');
const { CardController } = require('../controllers/CardController');
const { validateRequest, validateUUID } = require('../middleware/validation');
const { createCardSchema, updateCardSchema } = require('../validation/cardSchemas');

const router = Router();
const cardController = new CardController();

// POST /api/cards - Crear carta
router.post('/', validateRequest(createCardSchema), cardController.createCard);

// GET /api/cards - Obtener todas las cartas
router.get('/', cardController.getAllCards);

// POST /api/cards/initialize - Inicializar cartas por defecto
router.post('/initialize', cardController.initializeCards);

// GET /api/cards/:id - Obtener carta por ID
router.get('/:id', validateUUID, cardController.getCardById);

// PUT /api/cards/:id - Actualizar carta
router.put('/:id', validateUUID, validateRequest(updateCardSchema), cardController.updateCard);

// DELETE /api/cards/:id - Eliminar carta
router.delete('/:id', validateUUID, cardController.deleteCard);

module.exports = router;
