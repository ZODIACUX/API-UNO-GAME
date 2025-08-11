'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('game_players', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      isReady: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cardsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 7
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
    await queryInterface.addIndex('game_players', ['userId']);
    await queryInterface.addIndex('game_players', ['gameId']);
    await queryInterface.addIndex('game_players', ['userId', 'gameId'], {
      unique: true,
      name: 'unique_user_game'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('game_players');
  }
};