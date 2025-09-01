/**
 * Interface Segregation Principle (ISP) - Game-specific repository operations
 * Focused interface for game-related database operations
 */
class IGameRepository {
  /**
   * Find games by creator ID
   * @param {number} creatorId - Creator user ID
   * @returns {Promise<Result>} Result containing games or error
   */
  async findByCreatorId(_creatorId) {
    throw new Error('Method findByCreatorId must be implemented')
  }

  /**
   * Find games by status
   * @param {string} status - Game status (waiting, in_progress, finished)
   * @returns {Promise<Result>} Result containing games or error
   */
  async findByStatus(_status) {
    throw new Error('Method findByStatus must be implemented')
  }

  /**
   * Find active games (waiting or in_progress)
   * @param {Object} options - Query options
   * @returns {Promise<Result>} Result containing active games or error
   */
  async findActiveGames(_options = {}) {
    throw new Error('Method findActiveGames must be implemented')
  }

  /**
   * Update game status
   * @param {number} gameId - Game ID
   * @param {string} status - New status
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateGameStatus(_gameId, _status) {
    throw new Error('Method updateGameStatus must be implemented')
  }

  /**
   * Update current player
   * @param {number} gameId - Game ID
   * @param {number} playerId - Player ID
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateCurrentPlayer(_gameId, _playerId) {
    throw new Error('Method updateCurrentPlayer must be implemented')
  }

  /**
   * Update game direction
   * @param {number} gameId - Game ID
   * @param {string} direction - Game direction (clockwise, counterclockwise)
   * @returns {Promise<Result>} Result containing update result or error
   */
  async updateDirection(_gameId, _direction) {
    throw new Error('Method updateDirection must be implemented')
  }

  /**
   * Find games with player count
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Result>} Result containing games with player counts or error
   */
  async findGamesWithPlayerCount(_limit = 10) {
    throw new Error('Method findGamesWithPlayerCount must be implemented')
  }

  /**
   * Find game with full details (players, cards, etc.)
   * @param {number} gameId - Game ID
   * @returns {Promise<Result>} Result containing game with full details or error
   */
  async findWithFullDetails(_gameId) {
    throw new Error('Method findWithFullDetails must be implemented')
  }
}

module.exports = IGameRepository
