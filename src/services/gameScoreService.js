const { AppDataSource } = require('../config/data-source')
const { GameScore } = require('../models/GameScore')

class GameScoreService {
  constructor() {
    this.gameScoreRepository = AppDataSource.getRepository(GameScore)
  }

  async createScore(scoreData) {
    const existingScore = await this.gameScoreRepository.findOne({
      where: {
        gameId: scoreData.gameId,
        participantId: scoreData.participantId
      }
    })
    if (existingScore) {
      throw new Error('Score already exists for this participant in this game')
    }

    const score = this.gameScoreRepository.create(scoreData)
    return await this.gameScoreRepository.save(score)
  }

  async updateScore(id, scoreData) {
    const score = await this.gameScoreRepository.findOne({
      where: { id },
      relations: ['participant', 'game']
    })
    if (!score) {
      throw new Error('Score not found')
    }

    await this.gameScoreRepository.update(id, scoreData)
    return await this.gameScoreRepository.findOne({
      where: { id },
      relations: ['participant', 'game']
    })
  }

  async getGameScores(gameId) {
    return await this.gameScoreRepository.find({
      where: { gameId },
      relations: ['participant', 'game'],
      order: {
        points: 'DESC'
      }
    })
  }

  async getParticipantScores(participantId) {
    const scores = await this.gameScoreRepository.find({
      where: { participantId },
      relations: ['game'],
      order: {
        createdAt: 'DESC'
      }
    })
    if (!scores.length) {
      throw new Error('No scores found for this participant')
    }
    return scores
  }

  async getHighScores(limit = 10) {
    return await this.gameScoreRepository.find({
      relations: ['participant', 'participant.user', 'game'],
      order: {
        points: 'DESC'
      },
      take: limit
    })
  }

  async calculateFinalScores(gameId, participants) {
    const scores = participants.map((participant, index) => ({
      gameId,
      participantId: participant.id,
      points: participant.points,
      position: index + 1,
      createdAt: new Date()
    }))

    const createdScores = []
    for (const scoreData of scores) {
      const score = await this.createScore(scoreData)
      createdScores.push(score)
    }

    return createdScores
  }
}

module.exports = new GameScoreService()
