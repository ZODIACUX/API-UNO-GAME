require("reflect-metadata");
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { AppDataSource } = require('./database/data-source');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { CardService } = require('./services/CardService');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting con variables de entorno
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por defecto
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`;
  
  if (process.env.LOG_LEVEL === 'debug') {
    console.log(`${logMessage} - Body:`, req.body);
  } else {
    console.log(logMessage);
  }
  
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Game Management API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      players: '/api/players',
      games: '/api/games',
      cards: '/api/cards',
      scores: '/api/scores',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Validar variables de entorno críticas
    if (!process.env.DB_HOST || !process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
      throw new Error('Missing required database environment variables');
    }

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

    // Initialize default cards
    const cardService = new CardService();
    const initializedCards = await cardService.initializeCards();
    console.log(`🃏 Default cards initialized: ${initializedCards.length} cards`);

    // Start server
    app.listen(PORT, () => {
      console.log('🚀 ===================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log('🚀 ===================================');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  console.log('🔄 Shutting down the server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception:', err.message);
  console.log('🔄 Shutting down the server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

startServer();
