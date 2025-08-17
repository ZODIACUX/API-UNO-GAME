class IRepository {
  async findById(_id) {
    throw new Error('Method findById must be implemented')
  }

  async findAll() {
    throw new Error('Method findAll must be implemented')
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

module.exports = IRepository
