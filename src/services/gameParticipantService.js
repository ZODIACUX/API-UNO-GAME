const { AppDataSource } = require('../config/data-source')
const { GameParticipant } = require('../models/GameParticipant')

class GameParticipantService {
  constructor() {
    this.gameParticipantRepository = AppDataSource.getRepository(GameParticipant)
  }

  async joinGame(userId, gameId) {
    const existingParticipant = await this.gameParticipantRepository.findOne({
      where: { gameId, userId }
    })
    if (existingParticipant) {
      throw new Error('User already joined this game')
    }

    const participant = this.gameParticipantRepository.create({
      userId,
      gameId,
      joinedAt: new Date()
    })

    return await this.gameParticipantRepository.save(participant)
  }

  async leaveGame(userId, gameId) {
    const participant = await this.gameParticipantRepository.findOne({
      where: { gameId, userId }
    })
    if (!participant) {
      throw new Error('User not found in this game')
    }

    const result = await this.gameParticipantRepository.delete(participant.id)
    return result.affected > 0
  }

  async getParticipants(gameId) {
    return await this.gameParticipantRepository.find({
      where: { gameId },
      relations: ['user', 'game', 'score'],
      order: {
        score: { points: 'DESC' }
      }
    })
  }

  async getParticipantStats(userId) {
    const stats = await this.gameParticipantRepository
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

    if (!stats) {
      throw new Error('No stats found for this user')
    }
    return stats
  }

  async getLeaderboard(limit = 10) {
    return await this.gameParticipantRepository
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

  async updateParticipant(id, participantData) {
    const participant = await this.gameParticipantRepository.findOne({
      where: { id },
      relations: ['user', 'game', 'score']
    })
    if (!participant) {
      throw new Error('Participant not found')
    }

    await this.gameParticipantRepository.update(id, participantData)
    return await this.gameParticipantRepository.findOne({
      where: { id },
      relations: ['user', 'game', 'score']
    })
  }
}

module.exports = new GameParticipantService()
