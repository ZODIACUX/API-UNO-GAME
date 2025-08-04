
const { AppDataSource } = require("../database/data-source");
const { Card } = require("../entities/Card");
const { BaseRepository } = require("./BaseRepository");

class CardRepository extends BaseRepository {
  constructor() {
    super(AppDataSource.getRepository(Card));
  }

  async findByType(type) {
    return await this.repository.find({
      where: { type, isActive: true }
    });
  }

  async findByRarity(rarity) {
    return await this.repository.find({
      where: { rarity, isActive: true }
    });
  }

  async findActiveCards() {
    return await this.repository.find({
      where: { isActive: true }
    });
  }

  async initializeDefaultCards() {
    const defaultCards = [
      {
        name: "Carta Básica",
        description: "Una carta básica para comenzar",
        type: "basic",
        value: 10,
        rarity: "common",
        isActive: true,
        attributes: { power: 1, defense: 1 }
      },
      {
        name: "Carta de Fuego",
        description: "Una carta con poder de fuego",
        type: "elemental",
        value: 25,
        rarity: "uncommon",
        isActive: true,
        attributes: { power: 3, defense: 1, element: "fire" }
      },
      {
        name: "Carta Legendaria",
        description: "Una carta de poder supremo",
        type: "legendary",
        value: 100,
        rarity: "legendary",
        isActive: true,
        attributes: { power: 5, defense: 5, special: "ultimate" }
      }
    ];

    const cards = [];
    for (const cardData of defaultCards) {
      const existingCard = await this.repository.findOne({
        where: { name: cardData.name }
      });
      if (!existingCard) {
        const card = await this.create(cardData);
        cards.push(card);
      }
    }
    return cards;
  }
}

module.exports = { CardRepository };
