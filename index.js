// Cargar reflect-metadata antes de cualquier otra cosa
require('reflect-metadata')
require('dotenv').config()

const { AppDataSource } = require('./src/database/data-source')
const app = require('./src/app')
const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await AppDataSource.initialize()
    console.log('Database connection established successfully.')

    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize()
      console.log('Database synchronized')
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer()
