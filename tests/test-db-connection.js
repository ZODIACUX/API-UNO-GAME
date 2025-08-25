require('dotenv').config();
const { DataSource } = require('typeorm');

const testDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uno_game',
  synchronize: false,
  logging: true,
});

async function testConnection() {
  try {
    console.log('Intentando conectar a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Puerto: ${process.env.DB_PORT}`);
    console.log(`Usuario: ${process.env.DB_USER}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    
    await testDataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos!');
    
    // Probar una consulta simple
    const result = await testDataSource.query('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', result);
    
    await testDataSource.destroy();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Código de error:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Sugerencias:');
      console.log('1. Verifica que Docker Desktop esté corriendo');
      console.log('2. Ejecuta: docker ps para ver contenedores activos');
      console.log('3. Si no hay contenedores, ejecuta: setup-mysql-container.bat');
    }
    
    process.exit(1);
  }
}

testConnection();