const { Router } = require('express');
const playerRoutes = require('./playerRoutes');
const gameRoutes = require('./gameRoutes');
const cardRoutes = require('./cardRoutes');
const scoreRoutes = require('./scoreRoutes');
const unoRoutes = require('./unoRoutes'); // NUEVA LÍNEA

const router = Router();

router.use('/players', playerRoutes);
router.use('/games', gameRoutes);
router.use('/cards', cardRoutes);
router.use('/scores', scoreRoutes);
router.use('/uno', unoRoutes); // NUEVA LÍNEA

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['game-management', 'uno-card-game', 'jwt-auth'] // ACTUALIZADO
  });
});

module.exports = router;