class IReadRepository {
  async findById(_id) {
    throw new Error('Method findById must be implemented')
  }

  async findAll() {
    throw new Error('Method findAll must be implemented')
  }

  async findBy(_criteria) {
    throw new Error('Method findBy must be implemented')
  }

  async exists(_id) {
    throw new Error('Method exists must be implemented')
  }

  async count() {
    throw new Error('Method count must be implemented')
  }
}

module.exports = IReadRepository
