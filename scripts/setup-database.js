const mysql = require('mysql2/promise')

async function setupDatabase() {
  try {
    // Primero conectar como root
    const rootConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3319,
      user: 'root',
      password: 'rootpassword'
    })

    console.log('✅ Conectado como root')

    // Crear bases de datos
    await rootConnection.query('CREATE DATABASE IF NOT EXISTS game_management')
    await rootConnection.query('CREATE DATABASE IF NOT EXISTS game_management_test')
    console.log('✅ Bases de datos creadas')

    // Crear usuario si no existe
    await rootConnection.query(`
      CREATE USER IF NOT EXISTS 'gameuser'@'%' IDENTIFIED BY 'gamepassword'
    `)

    // Dar permisos al usuario
    await rootConnection.query(`
      GRANT ALL PRIVILEGES ON game_management.* TO 'gameuser'@'%'
    `)
    await rootConnection.query(`
      GRANT ALL PRIVILEGES ON game_management_test.* TO 'gameuser'@'%'
    `)
    await rootConnection.query('FLUSH PRIVILEGES')

    console.log('✅ Permisos configurados')

    await rootConnection.end()
    return true
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

setupDatabase()
  .then(success => process.exit(success ? 0 : 1))
