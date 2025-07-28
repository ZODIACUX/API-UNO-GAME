const { AppDataSource } = require("../database/data-source");
const { Score } = require("../entities/Score");
const { BaseRepository } = require("./BaseRepository");

class ScoreRepository extends BaseRepository {
  constructor() {
    super(AppDataSource.getRepository(Score));
  }

  async findByPlayerId(playerId) {
    return await this.repository.find({
      where: { playerId },
      relations: ['game'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByGameId(gameId) {
    return await this.repository.find({
      where: { gameId },
      relations: ['player'],
      order: { score: 'DESC' }
    });
  }

  async findTopScores(gameId = null, limit = 10) {
    const queryBuilder = this.repository.createQueryBuilder('score')
      .leftJoinAndSelect('score.player', 'player')
      .leftJoinAndSelect('score.game', 'game')
      .orderBy('score.score', 'DESC')
      .limit(limit);

    if (gameId) {
      queryBuilder.where('score.gameId = :gameId', { gameId });
    }

    return await queryBuilder.getMany();
  }

  async getPlayerBestScore(playerId, gameId) {
    return await this.repository.findOne({
      where: { playerId, gameId },
      order: { score: 'DESC' }
    });
  }
}

module.exports = { ScoreRepository };