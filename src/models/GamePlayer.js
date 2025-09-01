const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany } = require('typeorm')

@Entity('game_players')
@Index(['userId', 'gameId'], { unique: true })
class GamePlayer {
    @PrimaryGeneratedColumn()
      id

    @Column({ type: 'int' })
      userId

    @Column({ type: 'int' })
      gameId

    @Column({ type: 'int', default: 0 })
      score

    @Column({ type: 'int' })
      position

    @Column({ type: 'boolean', default: false })
      isReady

    @Column({ type: 'int', default: 7 })
      cardsCount

    @CreateDateColumn()
      createdAt

    @UpdateDateColumn()
      updatedAt

    @ManyToOne('User', 'gamePlayers')
    @JoinColumn({ name: 'userId' })
      user

    @ManyToOne('UnoGame', 'players')
    @JoinColumn({ name: 'gameId' })
      game

    @OneToMany('GameCard', 'player')
      cards

    @OneToMany('GameScore', 'participant')
      scores

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

module.exports = { GamePlayer }
