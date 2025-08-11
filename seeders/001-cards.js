'use strict';

const CardGenerator = require('../src/utils-api/cardGenerator');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const cards = CardGenerator.generateUNODeck();
    
    // Remover el ID ya que es auto-increment
    const cardsToInsert = cards.map(card => ({
      color: card.color,
      type: card.type,
      value: card.value
    }));

    await queryInterface.bulkInsert('cards', cardsToInsert);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cards', null, {});
  }
};