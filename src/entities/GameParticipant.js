const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

class GameParticipant {
}

// Apply decorators using the functional approach
Entity('game_participants')(GameParticipant)
PrimaryGeneratedColumn()(GameParticipant.prototype, 'id')
Column({ type: 'int' })(GameParticipant.prototype, 'gameId')
Column({ type: 'int' })(GameParticipant.prototype, 'userId')
Column({ type: 'int', default: 0 })(GameParticipant.prototype, 'position')
Column({ type: 'boolean', default: false })(GameParticipant.prototype, 'isWinner')
Column({ type: 'int', default: 0 })(GameParticipant.prototype, 'score')
CreateDateColumn()(GameParticipant.prototype, 'createdAt')
UpdateDateColumn()(GameParticipant.prototype, 'updatedAt')
ManyToOne('UnoGame', 'participants', { onDelete: 'CASCADE' })(GameParticipant.prototype, 'game')
JoinColumn({ name: 'gameId', referencedColumnName: 'id' })(GameParticipant.prototype, 'game')
ManyToOne('User', 'participatedGames', { onDelete: 'CASCADE' })(GameParticipant.prototype, 'user')
JoinColumn({ name: 'userId', referencedColumnName: 'id' })(GameParticipant.prototype, 'user')

module.exports = { GameParticipant }
