equire('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a MySQL...');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);
    console.log(`User: ${process.env.DB_USER || 'root'}`);
    console.log(`Database: ${process.env.DB_NAME || 'uno_game'}`);

    // Primero probar conexión sin base de datos específica
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Conexión a MySQL exitosa');

    // Verificar si la base de datos existe
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'uno_game'));
    
    if (dbExists) {
      console.log('✅ Base de datos encontrada');
    } else {
      console.log('⚠️  Base de datos no encontrada. Creando...');
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'uno_game'}\``);
      console.log('✅ Base de datos creada');
    }

    await connection.end();
    
    // Ahora probar conexión con la base de datos específica
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'uno_game'
    });

    console.log('✅ Conexión a la base de datos específica exitosa');
    await dbConnection.end();

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que MySQL esté ejecutándose');
      console.log('2. Confirma el host en tu archivo .env');
      console.log('3. Verifica el puerto (usualmente 3306)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica el usuario y contraseña en .env');
      console.log('2. Confirma que el usuario tenga permisos');
    }
    
    process.exit(1);
  }
}

testConnection();