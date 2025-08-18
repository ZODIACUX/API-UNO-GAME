const jwt = require('jsonwebtoken')

class TestHelpers {
  // Generate unique identifier for test data
  static generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create test user
  static async createTestUser(userData = {}) {
    const uniqueId = this.generateUniqueId()
    const defaultUser = {
      id: Math.floor(Math.random() * 10000),
      username: `testuser_${uniqueId}`,
      email: `test_${uniqueId}@example.com`,
      password: 'password123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    }

    // Return mock user object directly for tests
    return defaultUser
  }

  // Create multiple test users
  static async createTestUsers(count = 2) {
    const users = []
    for (let i = 1; i <= count; i++) {
      const uniqueId = this.generateUniqueId()
      const user = await this.createTestUser({
        username: `testuser${i}_${uniqueId}`,
        email: `test${i}_${uniqueId}@example.com`
      })
      users.push(user)
    }
    return users
  }

  // Create test game
  static async createTestGame(gameData = {}, creatorId = null) {
    let creator = creatorId
    if (!creator) {
      const testUser = await this.createTestUser()
      creator = testUser.id
    }

    const uniqueId = this.generateUniqueId()
    const defaultGame = {
      id: Math.floor(Math.random() * 10000),
      name: `Test Game ${uniqueId}`,
      rules: 'Standard UNO rules',
      status: 'waiting',
      creatorId: creator,
      maxPlayers: 4,
      direction: 'clockwise',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...gameData
    }

    return defaultGame
  }

  // Create test card
  static async createTestCard(cardData = {}) {
    const defaultCard = {
      id: Math.floor(Math.random() * 10000),
      color: 'red',
      type: 'number',
      value: '5',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...cardData
    }

    return defaultCard
  }

  // Create test game player
  static async createTestGamePlayer(gameId, userId, playerData = {}) {
    const defaultPlayer = {
      id: Math.floor(Math.random() * 10000),
      gameId,
      userId,
      score: 0,
      position: 1,
      isReady: false,
      cardsCount: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...playerData
    }

    return defaultPlayer
  }

  // Create test game score
  static async createTestGameScore(gameId, participantId, scoreData = {}) {
    const defaultScore = {
      id: Math.floor(Math.random() * 10000),
      gameId,
      participantId,
      points: 100,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...scoreData
    }

    return defaultScore
  }

  // Generate JWT token for testing
  static generateTestToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
  }

  // Clean all test data (mock implementation)
  static async cleanDatabase() {
    // Mock implementation - no actual database operations needed
    return Promise.resolve()
  }

  // Create complete game setup with players
  static async createGameWithPlayers(playerCount = 2) {
    const users = await this.createTestUsers(playerCount)
    const game = await this.createTestGame({}, users[0].id)

    const gamePlayers = []
    for (let i = 0; i < users.length; i++) {
      const gamePlayer = await this.createTestGamePlayer(game.id, users[i].id, {
        position: i + 1
      })
      gamePlayers.push(gamePlayer)
    }

    return { game, users, gamePlayers }
  }
}

module.exports = TestHelpers
