const { Entity, PrimaryGeneratedColumn, Column, OneToMany } = require('typeorm')

class Card {
}

// Apply decorators using the functional approach
Entity('cards')(Card)
PrimaryGeneratedColumn()(Card.prototype, 'id')
Column({
  type: 'enum',
  enum: ['red', 'blue', 'green', 'yellow', 'wild']
})(Card.prototype, 'color')
Column({
  type: 'enum',
  enum: ['number', 'skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four']
})(Card.prototype, 'type')
Column({ type: 'varchar', length: 20, nullable: true })(Card.prototype, 'value')
OneToMany('GameCard', 'card')(Card.prototype, 'gameCards')

module.exports = { Card }
