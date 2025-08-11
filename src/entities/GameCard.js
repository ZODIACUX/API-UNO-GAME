const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GameCard = sequelize.define('GameCard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cards',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    location: {
      type: DataTypes.ENUM('hand', 'deck', 'discard'),
      allowNull: false,
      defaultValue: 'deck'
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'game_cards',
    timestamps: true
  });

  return GameCard;
};