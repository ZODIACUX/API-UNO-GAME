const { Card } = require('../../../src/database').models;

describe('Card Model - CRUD Operations', () => {
  describe('Create Card', () => {
    it('should create a number card', async () => {
      const cardData = {
        color: 'red',
        type: 'number',
        value: '5'
      };

      const card = await Card.create(cardData);

      expect(card).toBeDefined();
      expect(card.color).toBe(cardData.color);
      expect(card.type).toBe(cardData.type);
      expect(card.value).toBe(cardData.value);
    });

    it('should create an action card', async () => {
      const cardData = {
        color: 'blue',
        type: 'skip',
        value: 'skip'
      };

      const card = await Card.create(cardData);

      expect(card.color).toBe('blue');
      expect(card.type).toBe('skip');
      expect(card.value).toBe('skip');
    });

    it('should create a wild card', async () => {
      const cardData = {
        color: 'wild',
        type: 'wild',
        value: 'wild'
      };

      const card = await Card.create(cardData);

      expect(card.color).toBe('wild');
      expect(card.type).toBe('wild');
      expect(card.value).toBe('wild');
    });

    it('should create a wild draw four card', async () => {
      const cardData = {
        color: 'wild',
        type: 'wild_draw_four',
        value: 'wild_draw_four'
      };

      const card = await Card.create(cardData);

      expect(card.color).toBe('wild');
      expect(card.type).toBe('wild_draw_four');
    });

    it('should validate required fields', async () => {
      await expect(Card.create({
        color: 'red'
        // Missing type
      })).rejects.toThrow();
    });

    it('should validate color enum values', async () => {
      await expect(Card.create({
        color: 'purple', // Invalid color
        type: 'number',
        value: '1'
      })).rejects.toThrow();
    });

    it('should validate type enum values', async () => {
      await expect(Card.create({
        color: 'red',
        type: 'invalid_type', // Invalid type
        value: '1'
      })).rejects.toThrow();
    });
  });

  describe('Read Card', () => {
    let cards;

    beforeEach(async () => {
      cards = await Promise.all([
        Card.create({ color: 'red', type: 'number', value: '1' }),
        Card.create({ color: 'blue', type: 'skip', value: 'skip' }),
        Card.create({ color: 'wild', type: 'wild', value: 'wild' })
      ]);
    });

    it('should find card by ID', async () => {
      const foundCard = await Card.findByPk(cards[0].id);

      expect(foundCard).toBeDefined();
      expect(foundCard.color).toBe('red');
      expect(foundCard.type).toBe('number');
      expect(foundCard.value).toBe('1');
    });

    it('should find cards by color', async () => {
      const redCards = await Card.findAll({
        where: { color: 'red' }
      });

      expect(redCards.length).toBeGreaterThan(0);
      expect(redCards.every(card => card.color === 'red')).toBe(true);
    });

    it('should find cards by type', async () => {
      const numberCards = await Card.findAll({
        where: { type: 'number' }
      });

      expect(numberCards.length).toBeGreaterThan(0);
      expect(numberCards.every(card => card.type === 'number')).toBe(true);
    });

    it('should find wild cards', async () => {
      const wildCards = await Card.findAll({
        where: { color: 'wild' }
      });

      expect(wildCards.length).toBeGreaterThan(0);
      expect(wildCards.every(card => card.color === 'wild')).toBe(true);
    });

    it('should return null for non-existent card', async () => {
      const foundCard = await Card.findByPk(99999);
      expect(foundCard).toBeNull();
    });
  });

  describe('Update Card', () => {
    let card;

    beforeEach(async () => {
      card = await Card.create({
        color: 'green',
        type: 'number',
        value: '3'
      });
    });

    it('should update card value', async () => {
      await card.update({ value: '7' });
      await card.reload();

      expect(card.value).toBe('7');
    });

    it('should update card color', async () => {
      await card.update({ color: 'yellow' });
      await card.reload();

      expect(card.color).toBe('yellow');
    });

    it('should update card type', async () => {
      await card.update({ type: 'reverse' });
      await card.reload();

      expect(card.type).toBe('reverse');
    });

    it('should validate enum values on update', async () => {
      await expect(card.update({
        color: 'invalid_color'
      })).rejects.toThrow();
    });
  });

  describe('Delete Card', () => {
    let card;

    beforeEach(async () => {
      card = await Card.create({
        color: 'yellow',
        type: 'draw_two',
        value: 'draw_two'
      });
    });

    it('should delete card successfully', async () => {
      const cardId = card.id;
      
      await card.destroy();
      
      const foundCard = await Card.findByPk(cardId);
      expect(foundCard).toBeNull();
    });

    it('should delete multiple cards', async () => {
      const card2 = await Card.create({
        color: 'red',
        type: 'number',
        value: '8'
      });

      const deletedCount = await Card.destroy({
        where: {
          id: [card.id, card2.id]
        }
      });

      expect(deletedCount).toBe(2);
    });
  });
});