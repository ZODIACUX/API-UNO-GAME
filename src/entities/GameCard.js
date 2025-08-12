const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

@Entity('game_cards')
class GameCard {
    @PrimaryGeneratedColumn()
      id

    @Column({ type: 'int' })
      gameId

    @Column({ type: 'int' })
      cardId

    @Column({ type: 'int', nullable: true })
      playerId

    @Column({
      type: 'enum',
      enum: ['hand', 'deck', 'discard'],
      default: 'deck'
    })
      location

    @Column({ type: 'int', nullable: true })
      position

    @CreateDateColumn()
      createdAt

    @UpdateDateColumn()
      updatedAt

    @ManyToOne('UnoGame', 'cards')
    @JoinColumn({ name: 'gameId' })
      game

    @ManyToOne('Card', 'gameCards')
    @JoinColumn({ name: 'cardId' })
      card

    @ManyToOne('GamePlayer', 'cards')
    @JoinColumn({ name: 'playerId' })
      player

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

module.exports = { GameCard }
