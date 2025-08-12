const { AppDataSource } = require('../src/database/data-source')
const CardSeeder = require('../seeders/001-cards')

async function setupDatabase() {
  try {
    // Inicializar la conexión con la base de datos
    await AppDataSource.initialize()
    console.log('✅ Base de datos conectada')

    // Ejecutar las migraciones pendientes
    console.log('🔄 Ejecutando migraciones...')
    await AppDataSource.runMigrations()
    console.log('✅ Migraciones completadas')

    // Ejecutar los seeders
    console.log('🌱 Ejecutando seeders...')
    const cardSeeder = new CardSeeder()
    await cardSeeder.run()
    console.log('✅ Seeders completados')

    console.log('✨ Base de datos configurada exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error)
    process.exit(1)
  }
}

setupDatabase()
