class IService {
  constructor(repository) {
    if (!repository) {
      throw new Error('Repository is required')
    }
    this.repository = repository
  }

  async getById(_id) {
    throw new Error('Method getById must be implemented')
  }

  async getAll() {
    throw new Error('Method getAll must be implemented')
  }

  async create(_data) {
    throw new Error('Method create must be implemented')
  }

  async update(_id, _data) {
    throw new Error('Method update must be implemented')
  }

  async delete(_id) {
    throw new Error('Method delete must be implemented')
  }
}

module.exports = IService
