const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('waiting', 'in_progress', 'finished'),
      defaultValue: 'waiting'
    },
    currentPlayerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    direction: {
      type: DataTypes.ENUM('clockwise', 'counterclockwise'),
      defaultValue: 'clockwise'
    },
    topCard: {
      type: DataTypes.JSON,
      allowNull: true
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      validate: {
        min: 2,
        max: 10
      }
    }
  }, {
    tableName: 'games',
    timestamps: true
  });

  return Game;
};
