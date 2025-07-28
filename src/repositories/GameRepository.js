const { AppDataSource } = require("../database/data-source");
const { Game } = require("../entities/Game");
const { BaseRepository } = require("./BaseRepository");

class GameRepository extends BaseRepository {
  constructor() {
    super(AppDataSource.getRepository(Game));
  }

  async findByCategory(category) {
    return await this.repository.find({
      where: { category, isActive: true }
    });
  }

  async findActiveGames() {
    return await this.repository.find({
      where: { isActive: true }
    });
  }

  async findWithScores(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['scores']
    });
  }
}

module.exports = { GameRepository };