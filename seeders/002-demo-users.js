const bcrypt = require('bcryptjs')
const { AppDataSource } = require('../src/database/data-source')
const { User } = require('../src/entities/User')

module.exports = class DemoUsersSeeder {
  async run() {
    const userRepository = AppDataSource.getRepository(User)
    const hashedPassword = await bcrypt.hash('password123', 12)

    const users = [
      {
        username: 'player1',
        email: 'player1@example.com',
        password: hashedPassword,
        isActive: true
      },
      {
        username: 'player2',
        email: 'player2@example.com',
        password: hashedPassword,
        isActive: true
      },
      {
        username: 'player3',
        email: 'player3@example.com',
        password: hashedPassword,
        isActive: true
      },
      {
        username: 'player4',
        email: 'player4@example.com',
        password: hashedPassword,
        isActive: true
      }
    ]

    const usersToInsert = users.map(userData => userRepository.create(userData))
    await userRepository.save(usersToInsert)
  }

  async revert() {
    const userRepository = AppDataSource.getRepository(User)
    await userRepository.delete({
      username: ['player1', 'player2', 'player3', 'player4']
    })
  }
}