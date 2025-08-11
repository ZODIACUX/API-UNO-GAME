'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rules: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('waiting', 'in_progress', 'finished'),
        defaultValue: 'waiting'
      },
      currentPlayerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      direction: {
        type: Sequelize.ENUM('clockwise', 'counterclockwise'),
        defaultValue: 'clockwise'
      },
      topCard: {
        type: Sequelize.JSON,
        allowNull: true
      },
      creatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      maxPlayers: {
        type: Sequelize.INTEGER,
        defaultValue: 4
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('games', ['creatorId']);
    await queryInterface.addIndex('games', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('games');
  }
};
