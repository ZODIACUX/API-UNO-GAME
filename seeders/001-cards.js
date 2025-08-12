const { AppDataSource } = require('../src/database/data-source')
const { Card } = require('../src/entities/Card')
const CardGenerator = require('../src/utils-api/cardGenerator')

module.exports = class CardSeeder {
  async run() {
    const cardRepository = AppDataSource.getRepository(Card)
    const cards = CardGenerator.generateUNODeck()

    // Remover el ID ya que es auto-increment
    const cardsToInsert = cards.map(card => cardRepository.create({
      color: card.color,
      type: card.type,
      value: card.value
    }))

    await cardRepository.save(cardsToInsert)
  }

  async revert() {
    const cardRepository = AppDataSource.getRepository(Card)
    await cardRepository.clear()
  }
}
