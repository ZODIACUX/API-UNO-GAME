const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define
  }
);

// Importar y definir modelos
const User = require('../entities/User')(sequelize);
const Game = require('../entities/Game')(sequelize);
const GamePlayer = require('../entities/GamePlayer')(sequelize);
const Card = require('../entities/Card')(sequelize);
const GameCard = require('../entities/GameCard')(sequelize);

// Definir asociaciones
User.hasMany(Game, { foreignKey: 'creatorId', as: 'createdGames' });
Game.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.belongsToMany(Game, { 
  through: GamePlayer, 
  foreignKey: 'userId',
  otherKey: 'gameId'
});
Game.belongsToMany(User, { 
  through: GamePlayer, 
  foreignKey: 'gameId',
  otherKey: 'userId'
});

User.hasMany(GamePlayer, { foreignKey: 'userId' });
GamePlayer.belongsTo(User, { foreignKey: 'userId' });

Game.hasMany(GamePlayer, { foreignKey: 'gameId' });
GamePlayer.belongsTo(Game, { foreignKey: 'gameId' });

Game.hasMany(GameCard, { foreignKey: 'gameId' });
GameCard.belongsTo(Game, { foreignKey: 'gameId' });

User.hasMany(GameCard, { foreignKey: 'userId' });
GameCard.belongsTo(User, { foreignKey: 'userId' });

Card.hasMany(GameCard, { foreignKey: 'cardId' });
GameCard.belongsTo(Card, { foreignKey: 'cardId' });

// Exportar sequelize y modelos
sequelize.models = {
  User,
  Game,
  GamePlayer,
  Card,
  GameCard
};

module.exports = sequelize;