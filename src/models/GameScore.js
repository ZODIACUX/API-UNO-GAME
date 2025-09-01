const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

@Entity('game_scores')
class GameScore {
      @PrimaryGeneratedColumn()
        id

      @Column({ type: 'int' })
        gameId

      @Column({ type: 'int' })
        participantId

      @Column({ type: 'int', default: 0 })
        points

      @Column({ type: 'int', default: 1 })
        position

      @CreateDateColumn()
        createdAt

      @UpdateDateColumn()
        updatedAt

      @ManyToOne('UnoGame', 'scores')
      @JoinColumn({ name: 'gameId' })
        game

      @ManyToOne('GamePlayer', 'scores')
      @JoinColumn({ name: 'participantId' })
        participant
}

module.exports = { GameScore }
