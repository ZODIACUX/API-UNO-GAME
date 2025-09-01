-- Active: 1755388571265@@127.0.0.1@3319@game_management
-- Active: 1755388571265@@127.0.0.1@3319@game_management
require('reflect-metadata');
require('dotenv').config();

const { AppDataSource } = require('../src/database/data-source');
const { UnoGame } = require('../src/entities/UnoGame');
const { GamePlayer } = require('../src/entities/GamePlayer');
const { GameParticipant } = require('../src/entities/GameParticipant');
const { GameScore } = require('../src/entities/GameScore');
const { GameCard } = require('../src/entities/GameCard');
const { User } = require('../src/entities/User');

const cleanDatabase = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida');

    console.log('🧹 Limpiando datos existentes...');

    // Deshabilitar foreign key checks temporalmente
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Eliminar todos los datos
    console.log('  - Eliminando GameCards...');
    await AppDataSource.getRepository(GameCard).clear();

    console.log('  - Eliminando GameScores...');
    await AppDataSource.getRepository(GameScore).clear();

    console.log('  - Eliminando GamePlayers...');
    await AppDataSource.getRepository(GamePlayer).clear();

    console.log('  - Eliminando GameParticipants...');
    await AppDataSource.getRepository(GameParticipant).clear();

    console.log('  - Eliminando Games...');
    await AppDataSource.getRepository(UnoGame).clear();

    console.log('  - Eliminando Users...');
    await AppDataSource.getRepository(User).clear();

    // Rehabilitar foreign key checks
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✨ Base de datos limpiada exitosamente');
    console.log('📊 Todos los usuarios y juegos han sido eliminados');

    // Verificar que todo esté limpio
    const userCount = await AppDataSource.getRepository(User).count();
    const gameCount = await AppDataSource.getRepository(UnoGame).count();
    
    console.log(`\n📈 Estado actual:`);
    console.log(`   Usuarios: ${userCount}`);
    console.log(`   Juegos: ${gameCount}`);

    await AppDataSource.destroy();
    console.log('🔚 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error.message);
    process.exit(1);
  }
};

cleanDatabase();