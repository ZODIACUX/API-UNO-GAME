const BaseRepository = require('../core/repositories/BaseRepository')
const { AppDataSource } = require('../database/data-source')
const { User } = require('../entities/User')
const Result = require('../core/errors/Result')

class UserRepository extends BaseRepository {
  constructor() {
    super(User, AppDataSource)
  }

  async findByUsername(username) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.findOne({ where: { username } })
    })
  }

  async findByUsernameWithPassword(username) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.findOne({
        where: { username },
        select: ['id', 'username', 'email', 'password', 'isActive', 'createdAt', 'updatedAt']
      })
    })
  }

  async findByEmail(email) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.findOne({ where: { email } })
    })
  }

  async findByUsernameOrEmail(username, email) {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.findOne({
        where: [
          { username },
          { email }
        ]
      })
    })
  }

  async findActiveUsers() {
    return Result.fromAsync(async () => {
      const repository = await this.getRepository()
      return await repository.find({ where: { isActive: true } })
    })
  }
}

module.exports = new UserRepository()
