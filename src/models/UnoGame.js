const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

@Entity('games')
class UnoGame {
    @PrimaryGeneratedColumn()
      id

    @Column({ type: 'varchar', length: 100 })
      name

    @Column({ type: 'text', nullable: true })
      rules

    @Column({
      type: 'enum',
      enum: ['waiting', 'in_progress', 'finished'],
      default: 'waiting'
    })
      status

    @Column({ type: 'int', nullable: true })
      currentPlayerId

    @Column({
      type: 'enum',
      enum: ['clockwise', 'counterclockwise'],
      default: 'clockwise'
    })
      direction

    @Column({ type: 'json', nullable: true })
      topCard

    @Column({ type: 'int' })
      creatorId

    @Column({ type: 'int', default: 4 })
      maxPlayers

    @CreateDateColumn()
      createdAt

    @UpdateDateColumn()
      updatedAt

    @ManyToOne('User', 'createdGames')
    @JoinColumn({ name: 'creatorId' })
      creator

    @OneToMany('GamePlayer', 'game')
      players

    @OneToMany('GameCard', 'game')
      cards
}

module.exports = { UnoGame }
