const jwt = require('jsonwebtoken')
const { AppDataSource } = require('../../src/database/data-source')
const { User } = require('../../src/entities/User')
const { UnoGame } = require('../../src/entities/UnoGame')
const { Card } = require('../../src/entities/Card')
const { GamePlayer } = require('../../src/entities/GamePlayer')
const { GameScore } = require('../../src/entities/GameScore')

class TestHelpers {
  // Generate unique identifier for test data
  static generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create test user
  static async createTestUser(userData = {}) {
    const userRepository = AppDataSource.getRepository(User)
    const uniqueId = this.generateUniqueId()
    const defaultUser = {
      username: `testuser_${uniqueId}`,
      email: `test_${uniqueId}@example.com`,
      password: 'password123', // Don't hash here, let the entity handle it
      isActive: true,
      ...userData
    }

    const user = userRepository.create(defaultUser)
    return await userRepository.save(user)
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
    const gameRepository = AppDataSource.getRepository(UnoGame)

    let creator = creatorId
    if (!creator) {
      const testUser = await this.createTestUser()
      creator = testUser.id
    }

    const uniqueId = this.generateUniqueId()
    const defaultGame = {
      name: `Test Game ${uniqueId}`,
      rules: 'Standard UNO rules',
      status: 'waiting',
      creatorId: creator,
      maxPlayers: 4,
      direction: 'clockwise',
      ...gameData
    }

    const game = gameRepository.create(defaultGame)
    return await gameRepository.save(game)
  }

  // Create test card
  static async createTestCard(cardData = {}) {
    const cardRepository = AppDataSource.getRepository(Card)
    const defaultCard = {
      color: 'red',
      type: 'number',
      value: '5',
      ...cardData
    }

    const card = cardRepository.create(defaultCard)
    return await cardRepository.save(card)
  }

  // Create test game player
  static async createTestGamePlayer(gameId, userId, playerData = {}) {
    const gamePlayerRepository = AppDataSource.getRepository(GamePlayer)
    const defaultPlayer = {
      gameId,
      userId,
      score: 0,
      position: 1,
      isReady: false,
      cardsCount: 7,
      ...playerData
    }

    const gamePlayer = gamePlayerRepository.create(defaultPlayer)
    return await gamePlayerRepository.save(gamePlayer)
  }

  // Create test game score
  static async createTestGameScore(gameId, participantId, scoreData = {}) {
    const gameScoreRepository = AppDataSource.getRepository(GameScore)
    const defaultScore = {
      gameId,
      participantId,
      points: 100,
      position: 1,
      ...scoreData
    }

    const gameScore = gameScoreRepository.create(defaultScore)
    return await gameScoreRepository.save(gameScore)
  }

  // Generate JWT token for testing
  static generateTestToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
  }

  // Clean all test data
  static async cleanDatabase() {
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')
    const tableOrder = ['game_scores', 'game_cards', 'game_players', 'games', 'cards', 'users']
    for (const tableName of tableOrder) {
      await AppDataSource.query(`DELETE FROM ${tableName}`)
      await AppDataSource.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`)
    }
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
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
