const { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } = require('typeorm')
const bcrypt = require('bcryptjs')

@Entity('users')
class User {
    @PrimaryGeneratedColumn()
      id

    @Column({ type: 'varchar', length: 50, unique: true })
      username

    @Column({ type: 'varchar', length: 100, unique: true })
      email

    @Column({ type: 'varchar', length: 255, select: false })
      password

    @Column({ type: 'boolean', default: true })
      isActive

    @CreateDateColumn()
      createdAt

    @UpdateDateColumn()
      updatedAt

    @OneToMany('UnoGame', 'creator')
      createdGames

    @OneToMany('GamePlayer', 'user')
      gamePlayers

    @OneToMany('GameCard', 'user')
      gameCards

    @OneToMany('GameParticipant', 'user')
      participatedGames

    @OneToMany('GameScore', 'user')
      scores

    @BeforeInsert()
    @BeforeUpdate()
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

module.exports = { User }
