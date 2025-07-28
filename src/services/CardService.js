const { CardRepository } = require("../repositories/CardRepository");

class CardService {
  constructor() {
    this.cardRepository = new CardRepository();
  }

  async createCard(cardData) {
    return await this.cardRepository.create(cardData);
  }

  async getAllCards() {
    return await this.cardRepository.findAll();
  }

  async getActiveCards() {
    return await this.cardRepository.findActiveCards();
  }

  async getCardById(id) {
    return await this.cardRepository.findById(id);
  }

  async getCardsByType(type) {
    return await this.cardRepository.findByType(type);
  }

  async getCardsByRarity(rarity) {
    return await this.cardRepository.findByRarity(rarity);
  }

  async updateCard(id, updateData) {
    const existingCard = await this.cardRepository.findById(id);
    if (!existingCard) {
      throw new Error('Card not found');
    }

    return await this.cardRepository.update(id, updateData);
  }

  async deleteCard(id) {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }

    return await this.cardRepository.delete(id);
  }

  async initializeCards() {
    return await this.cardRepository.initializeDefaultCards();
  }

  async deactivateCard(id) {
    return await this.updateCard(id, { isActive: false });
  }

  async activateCard(id) {
    return await this.updateCard(id, { isActive: true });
  }
}

module.exports = { CardService };