const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Card = sequelize.define('Card', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    color: {
      type: DataTypes.ENUM('red', 'blue', 'green', 'yellow', 'wild'),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('number', 'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four'),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'cards',
    timestamps: false
  });

  return Card;
};
