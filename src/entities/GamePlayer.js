const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany } = require('typeorm')

class GamePlayer {
  /**
   * Verifica si el jugador puede jugar una carta específica
   * @param {GameCard} card - La carta a verificar
   * @returns {boolean} - True si el jugador puede jugar la carta
   */
  canPlayCard(card) {
    return this.cards.some(playerCard => playerCard.id === card.id)
  }

  /**
   * Agrega una carta a la mano del jugador
   * @param {GameCard} card - La carta a agregar
   */
  addCard(card) {
    if (!this.cards) {
      this.cards = []
    }
    this.cards.push(card)
    this.cardsCount = this.cards.length
  }

  /**
   * Remueve una carta de la mano del jugador
   * @param {GameCard} card - La carta a remover
   * @returns {boolean} - True si la carta fue removida exitosamente
   */
  removeCard(card) {
    if (!this.cards) return false

    const index = this.cards.findIndex(c => c.id === card.id)
    if (index === -1) return false

    this.cards.splice(index, 1)
    this.cardsCount = this.cards.length
    return true
  }
}

// Apply decorators using the functional approach
Entity('game_players')(GamePlayer)
Index(['userId', 'gameId'], { unique: true })(GamePlayer)
PrimaryGeneratedColumn()(GamePlayer.prototype, 'id')
Column({ type: 'int' })(GamePlayer.prototype, 'userId')
Column({ type: 'int' })(GamePlayer.prototype, 'gameId')
Column({ type: 'int', default: 0 })(GamePlayer.prototype, 'score')
Column({ type: 'int' })(GamePlayer.prototype, 'position')
Column({ type: 'boolean', default: false })(GamePlayer.prototype, 'isReady')
Column({ type: 'int', default: 7 })(GamePlayer.prototype, 'cardsCount')
Column({ type: 'boolean', default: false })(GamePlayer.prototype, 'hasCalledUno')
Column({ type: 'timestamp', nullable: true })(GamePlayer.prototype, 'unoCallTimestamp')
CreateDateColumn()(GamePlayer.prototype, 'createdAt')
UpdateDateColumn()(GamePlayer.prototype, 'updatedAt')
ManyToOne('User', 'gamePlayers')(GamePlayer.prototype, 'user')
JoinColumn({ name: 'userId' })(GamePlayer.prototype, 'user')
ManyToOne('UnoGame', 'players')(GamePlayer.prototype, 'game')
JoinColumn({ name: 'gameId' })(GamePlayer.prototype, 'game')
OneToMany('GameCard', 'player')(GamePlayer.prototype, 'cards')
OneToMany('GameScore', 'participant')(GamePlayer.prototype, 'scores')

module.exports = { GamePlayer }
