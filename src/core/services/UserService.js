const BaseService = require('./BaseService')
const Result = require('../errors/Result')

class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository)
  }

  async register(userData) {
    const { username, email, password } = userData

    if (!username || !email || !password) {
      return Result.failure(new Error('Username, email, and password are required'))
    }

    const existingUserResult = await this.repository.findByUsernameOrEmail(username, email)
    if (existingUserResult.isSuccess && existingUserResult.value) {
      return Result.failure(new Error('User already exists'))
    }

    return await this.repository.create({
      username,
      email,
      password
    })
  }

  async findByUsernameOrEmail(username, email) {
    return await this.repository.findByUsernameOrEmail(username, email)
  }

  async findByUsernameWithPassword(username) {
    return await this.repository.findByUsernameWithPassword(username)
  }

  async findActiveUsers() {
    return await this.repository.findActiveUsers()
  }

  validateData(data) {
    const { username, email, password } = data

    if (!username || username.length < 3) {
      return Result.failure(new Error('Username must be at least 3 characters long'))
    }

    if (!email || !this.isValidEmail(email)) {
      return Result.failure(new Error('Valid email is required'))
    }

    if (!password || password.length < 6) {
      return Result.failure(new Error('Password must be at least 6 characters long'))
    }

    return Result.success(data)
  }

  validateUpdateData(data) {
    if (data.username && data.username.length < 3) {
      return Result.failure(new Error('Username must be at least 3 characters long'))
    }

    if (data.email && !this.isValidEmail(data.email)) {
      return Result.failure(new Error('Valid email is required'))
    }

    if (data.password && data.password.length < 6) {
      return Result.failure(new Error('Password must be at least 6 characters long'))
    }

    return Result.success(data)
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

module.exports = UserService
