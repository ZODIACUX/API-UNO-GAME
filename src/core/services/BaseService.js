const { IService } = require('../interfaces')
const Result = require('../errors/Result')

class BaseService extends IService {
  constructor(repository) {
    super(repository)
  }

  async getById(id) {
    if (!id) {
      return Result.failure(new Error('ID is required'))
    }

    const result = await this.repository.findById(id)
    return result.mapError(error => new Error(`Failed to get entity: ${error.message}`))
  }

  async getAll(options = {}) {
    const result = await this.repository.findAll(options)
    return result.mapError(error => new Error(`Failed to get entities: ${error.message}`))
  }

  async create(data) {
    if (!data) {
      return Result.failure(new Error('Data is required'))
    }

    const validationResult = this.validateData(data)
    if (!validationResult.isSuccess) {
      return validationResult
    }

    const result = await this.repository.create(data)
    return result.mapError(error => new Error(`Failed to create entity: ${error.message}`))
  }

  async update(id, data) {
    if (!id) {
      return Result.failure(new Error('ID is required'))
    }

    if (!data) {
      return Result.failure(new Error('Data is required'))
    }

    const validationResult = this.validateUpdateData(data)
    if (!validationResult.isSuccess) {
      return validationResult
    }

    const result = await this.repository.update(id, data)
    return result.mapError(error => new Error(`Failed to update entity: ${error.message}`))
  }

  async delete(id) {
    if (!id) {
      return Result.failure(new Error('ID is required'))
    }

    const result = await this.repository.delete(id)
    return result.mapError(error => new Error(`Failed to delete entity: ${error.message}`))
  }

  validateData(data) {
    return Result.success(data)
  }

  validateUpdateData(data) {
    return Result.success(data)
  }
}

module.exports = BaseService
