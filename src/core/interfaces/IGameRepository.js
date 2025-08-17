/**
 * Interface for Game-specific repository operations
 * Follows Interface Segregation Principle - only game-related methods
 */
class IGameRepository {
  async findByCreatorId(_creatorId) {
    throw new Error('Method findByCreatorId must be implemented')
  }

  async findByStatus(_status) {
    throw new Error('Method findByStatus must be implemented')
  }

  async findActiveGames() {
    throw new Error('Method findActiveGames must be implemented')
  }

  async updateGameStatus(_gameId, _status) {
    throw new Error('Method updateGameStatus must be implemented')
  }

  async setCurrentPlayer(_gameId, _playerId) {
    throw new Error('Method setCurrentPlayer must be implemented')
  }
}

module.exports = IGameRepository
