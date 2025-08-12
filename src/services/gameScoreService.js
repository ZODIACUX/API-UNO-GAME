const gameScoreRepository = require('../repositories/gameScoreRepository')
const { ApiError } = require('../utils-api/responseHelper')

class GameScoreService {
  async createScore(scoreData) {
    const existingScore = await gameScoreRepository.findByGameAndParticipant(
      scoreData.gameId,
      scoreData.participantId
    )
    if (existingScore) {
      throw new ApiError('Score already exists for this participant in this game', 400)
    }

    return await gameScoreRepository.create(scoreData)
  }

  async updateScore(id, scoreData) {
    const score = await gameScoreRepository.findById(id)
    if (!score) {
      throw new ApiError('Score not found', 404)
    }

    return await gameScoreRepository.update(id, scoreData)
  }

  async getGameScores(gameId) {
    return await gameScoreRepository.findByGame(gameId)
  }

  async getParticipantScores(participantId) {
    const scores = await gameScoreRepository.getParticipantScores(participantId)
    if (!scores.length) {
      throw new ApiError('No scores found for this participant', 404)
    }
    return scores
  }

  async getHighScores(limit) {
    return await gameScoreRepository.getHighScores(limit)
  }

  async calculateFinalScores(gameId, participants) {
    const scores = participants.map((participant, index) => ({
      gameId,
      participantId: participant.id,
      points: participant.points,
      position: index + 1,
      createdAt: new Date()
    }))

    return Promise.all(scores.map(score => this.createScore(score)))
  }
}

module.exports = new GameScoreService()
