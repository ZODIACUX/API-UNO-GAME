'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      color: {
        type: Sequelize.ENUM('red', 'blue', 'green', 'yellow', 'wild'),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('number', 'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four'),
        allowNull: false
      },
      value: {
        type: Sequelize.STRING(20),
        allowNull: true
      }
    });

    // Índices
    await queryInterface.addIndex('cards', ['color']);
    await queryInterface.addIndex('cards', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cards');
  }
};