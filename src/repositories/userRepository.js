const database = require('../database');

class UserRepository {
  async findById(id) {
    return await database.models.User.findByPk(id);
  }

  async findByUsername(username) {
    return await database.models.User.findOne({ where: { username } });
  }

  async findByEmail(email) {
    return await database.models.User.findOne({ where: { email } });
  }

  async findByUsernameOrEmail(username, email) {
    return await database.models.User.findOne({
      where: {
        [database.Sequelize.Op.or]: [{ username }, { email }]
      }
    });
  }

  async create(userData) {
    return await database.models.User.create(userData);
  }

  async update(id, userData) {
    const [updatedRows] = await database.models.User.update(userData, {
      where: { id }
    });
    return updatedRows > 0;
  }

  async delete(id) {
    const deletedRows = await database.models.User.destroy({
      where: { id }
    });
    return deletedRows > 0;
  }

  async findAll(options = {}) {
    return await database.models.User.findAll(options);
  }
}

module.exports = new UserRepository();