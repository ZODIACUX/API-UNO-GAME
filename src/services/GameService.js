const GameService = require('../core/services/GameService')
const gameRepository = require('../repositories/GameRepository')
const userRepository = require('../repositories/userRepository')
const Result = require('../core/errors/Result')

class LegacyGameService extends GameService {
  constructor() {
    super(gameRepository, userRepository)
  }

  async getTopCard(gameId) {
    return this.getGameState(gameId).then(result => {
      if (!result.isSuccess) {
        return result
      }

      return {
        game_id: gameId,
        top_card: result.value.topCard || 'No card'
      }
    })
  }

  async getScores(gameId) {
    return Result.fromAsync(async () => {
      if (!gameId) {
        throw new Error('Game ID is required')
      }

      const playersResult = await this.repository.getGamePlayers(gameId)
      if (!playersResult.isSuccess) {
        throw new Error('Failed to get game players')
      }

      const players = playersResult.value
      const scores = {}

      players.forEach(player => {
        scores[player.user.username] = player.score || 0
      })

      return {
        game_id: gameId,
        scores
      }
    })
  }
}

module.exports = LegacyGameService
