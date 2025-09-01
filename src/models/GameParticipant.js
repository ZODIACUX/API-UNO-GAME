const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

@Entity('game_participants')
class GameParticipant {
  @PrimaryGeneratedColumn()
    id

  @Column({ type: 'int' })
    gameId

  @Column({ type: 'int' })
    userId

  @Column({ type: 'int', default: 0 })
    position

  @Column({ type: 'boolean', default: false })
    isWinner

  @Column({ type: 'int', default: 0 })
    score

  @CreateDateColumn()
    createdAt

  @UpdateDateColumn()
    updatedAt

  @ManyToOne('UnoGame', 'participants', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId', referencedColumnName: 'id' })
    game

  @ManyToOne('User', 'participatedGames', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user
}

module.exports = { GameParticipant }
