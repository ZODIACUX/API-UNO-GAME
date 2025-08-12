const { AppDataSource } = require('../database/data-source')
const { GameScore } = require('../entities/GameScore')

class GameScoreRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(GameScore)
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['participant', 'game']
    })
  }

  async findByGameAndParticipant(gameId, participantId) {
    return await this.repository.findOne({
      where: { gameId, participantId },
      relations: ['participant', 'game']
    })
  }

  async findByGame(gameId) {
    return await this.repository.find({
      where: { gameId },
      relations: ['participant', 'game'],
      order: {
        points: 'DESC'
      }
    })
  }

  async create(scoreData) {
    const score = this.repository.create(scoreData)
    return await this.repository.save(score)
  }

  async update(id, scoreData) {
    await this.repository.update(id, scoreData)
    return await this.findById(id)
  }

  async getHighScores(limit = 10) {
    return await this.repository.find({
      relations: ['participant', 'participant.user', 'game'],
      order: {
        points: 'DESC'
      },
      take: limit
    })
  }

  async getParticipantScores(participantId) {
    return await this.repository.find({
      where: { participantId },
      relations: ['game'],
      order: {
        createdAt: 'DESC'
      }
    })
  }
}

module.exports = new GameScoreRepository()
