const { Entity, PrimaryGeneratedColumn, Column, OneToMany } = require('typeorm')

@Entity('cards')
class Card {
    @PrimaryGeneratedColumn()
      id

    @Column({
      type: 'enum',
      enum: ['red', 'blue', 'green', 'yellow', 'wild']
    })
      color

    @Column({
      type: 'enum',
      enum: ['number', 'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four']
    })
      type

    @Column({ type: 'varchar', length: 20, nullable: true })
      value

    @OneToMany('GameCard', 'card')
      gameCards
}

module.exports = { Card }
