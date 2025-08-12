const gameParticipantRepository = require('../repositories/gameParticipantRepository')
const { ApiError } = require('../utils-api/responseHelper')

class GameParticipantService {
  async joinGame(userId, gameId) {
    const existingParticipant = await gameParticipantRepository.findByGameAndUser(gameId, userId)
    if (existingParticipant) {
      throw new ApiError('User already joined this game', 400)
    }

    return await gameParticipantRepository.create({
      userId,
      gameId,
      joinedAt: new Date()
    })
  }

  async leaveGame(userId, gameId) {
    const participant = await gameParticipantRepository.findByGameAndUser(gameId, userId)
    if (!participant) {
      throw new ApiError('User not found in this game', 404)
    }

    return await gameParticipantRepository.delete(participant.id)
  }

  async getParticipants(gameId) {
    return await gameParticipantRepository.findByGame(gameId)
  }

  async getParticipantStats(userId) {
    const stats = await gameParticipantRepository.getParticipantStats(userId)
    if (!stats) {
      throw new ApiError('No stats found for this user', 404)
    }
    return stats
  }

  async getLeaderboard(limit) {
    return await gameParticipantRepository.getLeaderboard(limit)
  }

  async updateParticipant(id, participantData) {
    const participant = await gameParticipantRepository.findById(id)
    if (!participant) {
      throw new ApiError('Participant not found', 404)
    }

    return await gameParticipantRepository.update(id, participantData)
  }
}

module.exports = new GameParticipantService()
