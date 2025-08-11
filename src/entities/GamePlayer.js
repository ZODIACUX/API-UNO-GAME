const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GamePlayer = sequelize.define('GamePlayer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isReady: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cardsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 7
    }
  }, {
    tableName: 'game_players',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'gameId']
      }
    ]
  });

  return GamePlayer;
};