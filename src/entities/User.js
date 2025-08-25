const { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } = require('typeorm')
const bcrypt = require('bcryptjs')

class User {
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12)
    }
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
  }

  toJSON() {
    // eslint-disable-next-line no-unused-vars
    const { password, ...user } = this
    return user
  }
}

// Apply decorators using the functional approach
Entity('users')(User)
PrimaryGeneratedColumn()(User.prototype, 'id')
Column({ type: 'varchar', length: 50, unique: true })(User.prototype, 'username')
Column({ type: 'varchar', length: 100, unique: true })(User.prototype, 'email')
Column({ type: 'varchar', length: 255, select: false })(User.prototype, 'password')
Column({ type: 'boolean', default: true })(User.prototype, 'isActive')
CreateDateColumn()(User.prototype, 'createdAt')
UpdateDateColumn()(User.prototype, 'updatedAt')
OneToMany('UnoGame', 'creator')(User.prototype, 'createdGames')
OneToMany('GamePlayer', 'user')(User.prototype, 'gamePlayers')
OneToMany('GameCard', 'user')(User.prototype, 'gameCards')
OneToMany('GameParticipant', 'user')(User.prototype, 'participatedGames')
OneToMany('GameScore', 'user')(User.prototype, 'scores')
BeforeInsert()(User.prototype, 'hashPassword')
BeforeUpdate()(User.prototype, 'hashPassword')

module.exports = { User }
