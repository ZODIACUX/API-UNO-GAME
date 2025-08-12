const { AppDataSource } = require('../database/data-source')
const { GameParticipant } = require('../entities/GameParticipant')

class GameParticipantRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(GameParticipant)
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'game', 'score']
    })
  }

  async findByGameAndUser(gameId, userId) {
    return await this.repository.findOne({
      where: { gameId, userId },
      relations: ['user', 'game', 'score']
    })
  }

  async findByGame(gameId) {
    return await this.repository.find({
      where: { gameId },
      relations: ['user', 'game', 'score'],
      order: {
        score: { points: 'DESC' }
      }
    })
  }

  async create(participantData) {
    const participant = this.repository.create(participantData)
    return await this.repository.save(participant)
  }

  async update(id, participantData) {
    await this.repository.update(id, participantData)
    return await this.findById(id)
  }

  async delete(id) {
    const result = await this.repository.delete(id)
    return result.affected > 0
  }

  async getParticipantStats(userId) {
    return await this.repository
      .createQueryBuilder('participant')
      .leftJoin('participant.score', 'score')
      .select([
        'participant.id',
        'COUNT(participant.id) as gamesPlayed',
        'SUM(CASE WHEN score.position = 1 THEN 1 ELSE 0 END) as wins',
        'AVG(score.points) as averagePoints'
      ])
      .where('participant.userId = :userId', { userId })
      .groupBy('participant.id')
      .getRawOne()
  }

  async getLeaderboard(limit = 10) {
    return await this.repository
      .createQueryBuilder('participant')
      .leftJoin('participant.score', 'score')
      .leftJoin('participant.user', 'user')
      .select([
        'user.username',
        'COUNT(participant.id) as gamesPlayed',
        'SUM(CASE WHEN score.position = 1 THEN 1 ELSE 0 END) as wins',
        'AVG(score.points) as averagePoints'
      ])
      .groupBy('user.id')
      .orderBy('wins', 'DESC')
      .addOrderBy('averagePoints', 'DESC')
      .limit(limit)
      .getRawMany()
  }
}

module.exports = new GameParticipantRepository()
