const express = require('express')
const router = express.Router()
const cardController = require('../controllers/cardController')
const authMiddleware = require('../middleware/auth')
const {
  validateCard,
  validateCards,
  validateCardParams,
  validateCardType,
  validateCardColor
} = require('../validation/cardValidation')

// Middleware de autenticación para todas las rutas
router.use(authMiddleware)

// GET /api/cards - Obtener todas las cartas
router.get('/', cardController.getAllCards)

// GET /api/cards/:id - Obtener una carta por ID
router.get('/:id', validateCardParams, cardController.getCard)

// GET /api/cards/type/:type - Obtener cartas por tipo
router.get('/type/:type', validateCardType, cardController.getCardsByType)

// GET /api/cards/color/:color - Obtener cartas por color
router.get('/color/:color', validateCardColor, cardController.getCardsByColor)

// POST /api/cards - Crear una nueva carta
router.post('/', validateCard, cardController.createCard)

// POST /api/cards/batch - Crear múltiples cartas
router.post('/batch', validateCards, cardController.createManyCards)

module.exports = router
