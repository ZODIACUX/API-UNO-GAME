require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
// Removed complex dependency injection system for simplified architecture

const app = express()

// Middleware de seguridad
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana de tiempo
})
app.use(limiter)

// Middleware de parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api', require('./routes/index'))

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Middleware de manejo de errores
const ErrorHandler = require('./middlewares/ErrorHandler')

// Middleware para rutas no encontradas
app.use('*', ErrorHandler.notFound)

// Middleware de validación de errores
app.use(ErrorHandler.validation)

// Middleware principal de manejo de errores
app.use(ErrorHandler.handle)

module.exports = app
