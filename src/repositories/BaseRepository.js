class BaseRepository {
  constructor(repository) {
    this.repository = repository;
  }

  async create(entity) {
    const newEntity = this.repository.create(entity);
    return await this.repository.save(newEntity);
  }

  async findAll(options = {}) {
    return await this.repository.find(options);
  }

  async findById(id, options = {}) {
    return await this.repository.findOne({
      where: { id },
      ...options
    });
  }

  async update(id, updateData) {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id) {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async count(options = {}) {
    return await this.repository.count(options);
  }
}

module.exports = { BaseRepository };
