require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDockerConnection() {
  try {
    console.log('🐳 Probando conexión a MySQL Docker...');
    console.log('='.repeat(50));
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('='.repeat(50));

    // Probar conexión directa a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión a MySQL Docker exitosa');

    // Verificar que la base de datos existe
    const [result] = await connection.execute('SELECT DATABASE() as current_db');
    console.log(`✅ Base de datos actual: ${result[0].current_db}`);

    // Verificar versión de MySQL
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`✅ Versión MySQL: ${version[0].version}`);

    // Verificar tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Tablas existentes: ${tables.length}`);
    if (tables.length > 0) {
      console.log('   Tablas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('   ⚠️  No hay tablas. Necesitas ejecutar migraciones.');
    }

    await connection.end();
    console.log('='.repeat(50));
    console.log('🎉 Conexión probada exitosamente');
    console.log('💡 Siguiente paso: npm run migrate');

  } catch (error) {
    console.log('='.repeat(50));
    console.error('❌ Error de conexión:', error.message);
    console.log('='.repeat(50));
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Posibles soluciones:');
      console.log('1. Verifica que el contenedor Docker esté ejecutándose:');
      console.log('   docker ps');
      console.log('2. Si no está ejecutándose, iniciarlo:');
      console.log('   npm run docker:start');
      console.log('3. Verificar logs del contenedor:');
      console.log('   npm run docker:logs');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 El puerto está cerrado. Verifica:');
      console.log('1. docker ps');
      console.log('2. npm run docker:start');
      console.log('3. Verificar que el puerto 3319 esté mapeado correctamente');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Credenciales incorrectas. Verifica:');
      console.log('1. Usuario:', process.env.DB_USER);
      console.log('2. Contraseña en .env');
      console.log('3. Base de datos:', process.env.DB_NAME);
    }
    
    console.log('='.repeat(50));
    process.exit(1);
  }
}

testDockerConnection();