const { Router } = require('express');
const playerRoutes = require('./playerRoutes');
const gameRoutes = require('./gameRoutes');
const cardRoutes = require('./cardRoutes');
const scoreRoutes = require('./scoreRoutes');

const router = Router();

router.use('/players', playerRoutes);
router.use('/games', gameRoutes);
router.use('/cards', cardRoutes);
router.use('/scores', scoreRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;