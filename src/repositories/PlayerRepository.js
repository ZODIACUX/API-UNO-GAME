const { AppDataSource } = require("../database/data-source");
const { Player } = require("../entities/Player");
const { BaseRepository } = require("./BaseRepository");

class PlayerRepository extends BaseRepository {
  constructor() {
    super(AppDataSource.getRepository(Player));
  }

  async findByUsername(username) {
    return await this.repository.findOne({
      where: { username }
    });
  }

  async findByEmail(email) {
    return await this.repository.findOne({
      where: { email }
    });
  }

  async findWithScores(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['scores']
    });
  }

  async getTopPlayers(limit = 10) {
    return await this.repository.find({
      order: { totalScore: 'DESC' },
      take: limit
    });
  }
}

module.exports = { PlayerRepository };