const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

class UnoGame {
}

// Apply decorators using the functional approach
Entity('games')(UnoGame)
PrimaryGeneratedColumn()(UnoGame.prototype, 'id')
Column({ type: 'varchar', length: 100 })(UnoGame.prototype, 'name')
Column({ type: 'text', nullable: true })(UnoGame.prototype, 'rules')
Column({
  type: 'enum',
  enum: ['waiting', 'in_progress', 'finished'],
  default: 'waiting'
})(UnoGame.prototype, 'status')
Column({ type: 'int', nullable: true })(UnoGame.prototype, 'currentPlayerId')
Column({
  type: 'enum',
  enum: ['clockwise', 'counterclockwise'],
  default: 'clockwise'
})(UnoGame.prototype, 'direction')
Column({ type: 'json', nullable: true })(UnoGame.prototype, 'topCard')
Column({ type: 'int' })(UnoGame.prototype, 'creatorId')
Column({ type: 'int', default: 4 })(UnoGame.prototype, 'maxPlayers')
CreateDateColumn()(UnoGame.prototype, 'createdAt')
UpdateDateColumn()(UnoGame.prototype, 'updatedAt')
ManyToOne('User', 'createdGames')(UnoGame.prototype, 'creator')
JoinColumn({ name: 'creatorId' })(UnoGame.prototype, 'creator')
OneToMany('GamePlayer', 'game')(UnoGame.prototype, 'players')
OneToMany('GameCard', 'game')(UnoGame.prototype, 'cards')

module.exports = { UnoGame }
