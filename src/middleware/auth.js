const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../database/data-source');
const { User } = require('../entities/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // También acepta token en el body para compatibilidad con los ejemplos
    const bodyToken = req.body.access_token;
    const finalToken = token || bodyToken;

    if (!finalToken) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(finalToken, JWT_SECRET);
    
    // Verificar que el usuario existe
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.user_id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid credentials'
    });
  }
};

module.exports = { authenticateToken, JWT_SECRET };
