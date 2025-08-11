const { CARD_COLORS, CARD_TYPES } = require('./constants');

class CardGenerator {
  static generateUNODeck() {
    const cards = [];
    let cardId = 1;

    // Cartas numeradas (0-9) para cada color
    Object.values(CARD_COLORS).forEach(color => {
      if (color !== CARD_COLORS.WILD) {
        // Carta 0 (solo una por color)
        cards.push({
          id: cardId++,
          color,
          type: CARD_TYPES.NUMBER,
          value: '0'
        });

        // Cartas 1-9 (dos por color)
        for (let num = 1; num <= 9; num++) {
          cards.push({
            id: cardId++,
            color,
            type: CARD_TYPES.NUMBER,
            value: num.toString()
          });
          cards.push({
            id: cardId++,
            color,
            type: CARD_TYPES.NUMBER,
            value: num.toString()
          });
        }

        // Cartas especiales (dos por color)
        [CARD_TYPES.SKIP, CARD_TYPES.REVERSE, CARD_TYPES.DRAW_TWO].forEach(type => {
          cards.push({
            id: cardId++,
            color,
            type,
            value: type
          });
          cards.push({
            id: cardId++,
            color,
            type,
            value: type
          });
        });
      }
    });

    // Cartas Wild (4 de cada tipo)
    for (let i = 0; i < 4; i++) {
      cards.push({
        id: cardId++,
        color: CARD_COLORS.WILD,
        type: CARD_TYPES.WILD,
        value: 'wild'
      });
      cards.push({
        id: cardId++,
        color: CARD_COLORS.WILD,
        type: CARD_TYPES.WILD_DRAW_FOUR,
        value: 'wild_draw_four'
      });
    }

    return cards;
  }

  static shuffleDeck(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = CardGenerator;