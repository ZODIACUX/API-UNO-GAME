class IWriteRepository {
  async create(_data) {
    throw new Error('Method create must be implemented')
  }

  async update(_id, _data) {
    throw new Error('Method update must be implemented')
  }

  async delete(_id) {
    throw new Error('Method delete must be implemented')
  }

  async bulkCreate(_dataArray) {
    throw new Error('Method bulkCreate must be implemented')
  }

  async bulkUpdate(_updates) {
    throw new Error('Method bulkUpdate must be implemented')
  }

  async bulkDelete(_ids) {
    throw new Error('Method bulkDelete must be implemented')
  }
}

module.exports = IWriteRepository
