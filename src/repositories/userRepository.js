const { AppDataSource } = require('../database/data-source')
const { User } = require('../entities/User')

class UserRepository {
  constructor() {
    this.repository = null
  }

  async getRepository() {
    if (!this.repository) {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }
      this.repository = AppDataSource.getRepository(User)
    }
    return this.repository
  }

  async findById(id) {
    const repository = await this.getRepository()
    return await repository.findOne({ where: { id } })
  }

  async findByUsername(username) {
    const repository = await this.getRepository()
    return await repository.findOne({ where: { username } })
  }

  async findByUsernameWithPassword(username) {
    const repository = await this.getRepository()
    return await repository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'isActive', 'createdAt', 'updatedAt']
    })
  }

  async findByEmail(email) {
    const repository = await this.getRepository()
    return await repository.findOne({ where: { email } })
  }

  async findByUsernameOrEmail(username, email) {
    const repository = await this.getRepository()
    return await repository.findOne({
      where: [
        { username },
        { email }
      ]
    })
  }

  async create(userData) {
    const repository = await this.getRepository()
    const user = repository.create(userData)
    return await repository.save(user)
  }

  async update(id, userData) {
    const repository = await this.getRepository()
    const result = await repository.update(id, userData)
    return result.affected > 0
  }

  async delete(id) {
    const repository = await this.getRepository()
    const result = await repository.delete(id)
    return result.affected > 0
  }

  async findAll(options = {}) {
    const repository = await this.getRepository()
    return await repository.find(options)
  }
}

module.exports = new UserRepository()
