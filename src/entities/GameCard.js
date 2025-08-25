const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

class GameCard {
  /**
   * Obtiene una representación del estado de la carta
   * @returns {Object} El estado de la carta
   */
  getState() {
    return {
      id: this.id,
      location: this.location,
      position: this.position,
      cardId: this.cardId,
      playerId: this.playerId
    }
  }
}

// Apply decorators using the functional approach
Entity('game_cards')(GameCard)
PrimaryGeneratedColumn()(GameCard.prototype, 'id')
Column({ type: 'int' })(GameCard.prototype, 'gameId')
Column({ type: 'int' })(GameCard.prototype, 'cardId')
Column({ type: 'int', nullable: true })(GameCard.prototype, 'playerId')
Column({
  type: 'enum',
  enum: ['hand', 'deck', 'discard'],
  default: 'deck'
})(GameCard.prototype, 'location')
Column({ type: 'int', nullable: true })(GameCard.prototype, 'position')
CreateDateColumn()(GameCard.prototype, 'createdAt')
UpdateDateColumn()(GameCard.prototype, 'updatedAt')
ManyToOne('UnoGame', 'cards')(GameCard.prototype, 'game')
JoinColumn({ name: 'gameId' })(GameCard.prototype, 'game')
ManyToOne('Card', 'gameCards')(GameCard.prototype, 'card')
JoinColumn({ name: 'cardId' })(GameCard.prototype, 'card')
ManyToOne('GamePlayer', 'cards')(GameCard.prototype, 'player')
JoinColumn({ name: 'playerId' })(GameCard.prototype, 'player')

module.exports = { GameCard }
