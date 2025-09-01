const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm')

class GameScore {
}

// Apply decorators using the functional approach
Entity('game_scores')(GameScore)
PrimaryGeneratedColumn()(GameScore.prototype, 'id')
Column({ type: 'int' })(GameScore.prototype, 'gameId')
Column({ type: 'int' })(GameScore.prototype, 'participantId')
Column({ type: 'int', default: 0 })(GameScore.prototype, 'points')
Column({ type: 'int', default: 1 })(GameScore.prototype, 'position')
CreateDateColumn()(GameScore.prototype, 'createdAt')
UpdateDateColumn()(GameScore.prototype, 'updatedAt')
ManyToOne('UnoGame', 'scores')(GameScore.prototype, 'game')
JoinColumn({ name: 'gameId' })(GameScore.prototype, 'game')
ManyToOne('GamePlayer', 'scores')(GameScore.prototype, 'participant')
JoinColumn({ name: 'participantId' })(GameScore.prototype, 'participant')

module.exports = { GameScore }
