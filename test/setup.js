require('dotenv').config({ path: '.env.test' });
const database = require('../src/database');

// Configuración global para tests
beforeAll(async () => {
  // Conectar a base de datos de test
  await database.authenticate();
  
  // Sincronizar modelos (crear tablas)
  await database.sync({ force: true });
  
  console.log('Test database connected and synchronized');
});

afterAll(async () => {
  // Cerrar conexiones
  await database.close();
  console.log('Test database connection closed');
});

// Limpiar base de datos entre tests
beforeEach(async () => {
  // Limpiar todas las tablas
  await database.models.GameCard.destroy({ where: {}, force: true });
  await database.models.GamePlayer.destroy({ where: {}, force: true });
  await database.models.Game.destroy({ where: {}, force: true });
  await database.models.User.destroy({ where: {}, force: true });
});