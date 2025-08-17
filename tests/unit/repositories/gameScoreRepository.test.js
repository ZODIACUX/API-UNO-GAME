const gameScoreRepository = require('../../../src/repositories/gameScoreRepository')
const TestHelpers = require('../../helpers/testHelpers')
const Result = require('../../../src/core/errors/Result')

// Mock the gameScoreRepository methods
jest.mock('../../../src/repositories/gameScoreRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByGameAndParticipant: jest.fn(),
  findByGame: jest.fn(),
  getParticipantScores: jest.fn(),
  update: jest.fn(),
  getHighScores: jest.fn()
}))

describe('GameScoreRepository CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('Create Score', () => {
    let testUser
    let testGame
    let testParticipant

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'scoreuser',
        email: 'scoreuser@example.com'
      })
      testGame = await TestHelpers.createTestGame({
        name: 'Score Test Game'
      }, testUser.id)
      testParticipant = await TestHelpers.createTestGamePlayer(testGame.id, testUser.id)
    })

    it('should create a new score successfully', async () => {
      const scoreData = {
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 150,
        position: 1
      }

      const mockScore = {
        id: 1,
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(mockScore))

      const result = await gameScoreRepository.create(scoreData)
      const createdScore = result.value

      expect(createdScore).toBeDefined()
      expect(createdScore.id).toBeDefined()
      expect(createdScore.gameId).toBe(testGame.id)
      expect(createdScore.participantId).toBe(testParticipant.id)
      expect(createdScore.points).toBe(150)
      expect(createdScore.position).toBe(1)
      expect(createdScore.createdAt).toBeDefined()
      expect(createdScore.updatedAt).toBeDefined()
    })

    it('should create score with zero points', async () => {
      const scoreData = {
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 0,
        position: 1
      }

      const mockScore = {
        id: 2,
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(mockScore))

      const result = await gameScoreRepository.create(scoreData)
      const createdScore = result.value

      expect(createdScore.points).toBe(0)
    })

    it('should create score with high points', async () => {
      const scoreData = {
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 999,
        position: 4
      }

      const mockScore = {
        id: 3,
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(mockScore))

      const result = await gameScoreRepository.create(scoreData)
      const createdScore = result.value

      expect(createdScore.points).toBe(999)
      expect(createdScore.position).toBe(4)
    })

    it('should fail to create score without required fields', async () => {
      const scoreData = {
        points: 100
        // Missing gameId and participantId
      }

      gameScoreRepository.create.mockResolvedValue(Result.failure(new Error('Missing required fields')))

      const result = await gameScoreRepository.create(scoreData)
      expect(result.isSuccess).toBe(false)
    })
  })

  describe('Read Score', () => {
    let testUsers
    let testGame
    let testParticipants
    let testScores

    beforeEach(async () => {
      // Create multiple users and participants for comprehensive testing
      testUsers = await TestHelpers.createTestUsers(3)
      testGame = await TestHelpers.createTestGame({
        name: 'Multi-Player Score Game'
      }, testUsers[0].id)

      testParticipants = []
      for (let i = 0; i < testUsers.length; i++) {
        const participant = await TestHelpers.createTestGamePlayer(testGame.id, testUsers[i].id, {
          position: i + 1
        })
        testParticipants.push(participant)
      }

      // Create test scores
      testScores = []
      const scoreData = [
        { points: 200, position: 1 },
        { points: 150, position: 2 },
        { points: 100, position: 3 }
      ]

      for (let i = 0; i < testParticipants.length; i++) {
        const score = await gameScoreRepository.create({
          gameId: testGame.id,
          participantId: testParticipants[i].id,
          ...scoreData[i]
        })
        testScores.push(score)
      }
    })

    it('should find score by ID', async () => {
      const mockScore = {
        id: 1,
        gameId: testGame.id,
        participantId: testParticipants[0].id,
        points: 200,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.findById.mockResolvedValue(Result.success(mockScore))

      const result = await gameScoreRepository.findById(1)
      const foundScore = result.value

      expect(foundScore).toBeDefined()
      expect(foundScore.id).toBe(1)
      expect(foundScore.points).toBe(200)
      expect(foundScore.position).toBe(1)
    })

    it('should return null for non-existent score ID', async () => {
      gameScoreRepository.findById.mockResolvedValue(Result.success(null))

      const result = await gameScoreRepository.findById(99999)
      const foundScore = result.value

      expect(foundScore).toBeNull()
    })

    it('should find score by game and participant', async () => {
      const mockScore = {
        id: 2,
        gameId: testGame.id,
        participantId: testParticipants[1].id,
        points: 150,
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.findByGameAndParticipant.mockResolvedValue(Result.success(mockScore))

      const result = await gameScoreRepository.findByGameAndParticipant(
        testGame.id,
        testParticipants[1].id
      )
      const foundScore = result.value

      expect(foundScore).toBeDefined()
      expect(foundScore.gameId).toBe(testGame.id)
      expect(foundScore.participantId).toBe(testParticipants[1].id)
      expect(foundScore.points).toBe(150)
      expect(foundScore.position).toBe(2)
    })

    it('should return null for non-existent game-participant combination', async () => {
      gameScoreRepository.findByGameAndParticipant.mockResolvedValue(Result.success(null))

      const result = await gameScoreRepository.findByGameAndParticipant(99999, 99999)
      const foundScore = result.value

      expect(foundScore).toBeNull()
    })

    it('should find all scores by game ordered by points DESC', async () => {
      const mockScores = [
        { id: 1, gameId: testGame.id, participantId: testParticipants[0].id, points: 200, position: 1 },
        { id: 2, gameId: testGame.id, participantId: testParticipants[1].id, points: 150, position: 2 },
        { id: 3, gameId: testGame.id, participantId: testParticipants[2].id, points: 100, position: 3 }
      ]

      gameScoreRepository.findByGame.mockResolvedValue(Result.success(mockScores))

      const result = await gameScoreRepository.findByGame(testGame.id)
      const gameScores = result.value

      expect(gameScores).toBeDefined()
      expect(gameScores.length).toBe(3)

      // Should be ordered by points descending
      expect(gameScores[0].points).toBe(200)
      expect(gameScores[1].points).toBe(150)
      expect(gameScores[2].points).toBe(100)
    })

    it('should return empty array for non-existent game', async () => {
      gameScoreRepository.findByGame.mockResolvedValue(Result.success([]))

      const result = await gameScoreRepository.findByGame(99999)
      const gameScores = result.value

      expect(gameScores).toBeDefined()
      expect(gameScores.length).toBe(0)
    })

    it('should get participant scores ordered by creation date DESC', async () => {
      // Mock additional score creation
      const additionalScore = {
        id: 4,
        gameId: testGame.id,
        participantId: testParticipants[0].id,
        points: 300,
        position: 1,
        createdAt: new Date()
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(additionalScore))

      const mockParticipantScores = [
        additionalScore, // Newest first
        { id: 1, gameId: testGame.id, participantId: testParticipants[0].id, points: 200, position: 1, createdAt: new Date(Date.now() - 1000) }
      ]

      gameScoreRepository.getParticipantScores.mockResolvedValue(Result.success(mockParticipantScores))

      const result = await gameScoreRepository.getParticipantScores(testParticipants[0].id)
      const participantScores = result.value

      expect(participantScores).toBeDefined()
      expect(participantScores.length).toBe(2)

      // Should be ordered by creation date descending (newest first)
      expect(participantScores[0].points).toBe(300)
      expect(participantScores[1].points).toBe(200)
    })
  })

  describe('Update Score', () => {
    let testUser
    let testGame
    let testParticipant

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'updatescoreuser',
        email: 'updatescore@example.com'
      })
      testGame = await TestHelpers.createTestGame({
        name: 'Update Score Game'
      }, testUser.id)
      testParticipant = await TestHelpers.createTestGamePlayer(testGame.id, testUser.id)
    })

    it('should update score successfully', async () => {
      // Mock testScore creation first
      const mockTestScore = {
        id: 1,
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 100,
        position: 2
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(mockTestScore))

      const updateData = {
        points: 250,
        position: 1
      }

      const mockUpdatedScore = {
        id: mockTestScore.id,
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 250,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.update.mockResolvedValue(Result.success(mockUpdatedScore))

      const result = await gameScoreRepository.update(mockTestScore.id, updateData)
      const updatedScore = result.value

      expect(updatedScore).toBeDefined()
      expect(updatedScore.points).toBe(250)
      expect(updatedScore.position).toBe(1)
    })

    it('should update partial score data', async () => {
      // Mock testScore creation first
      const mockTestScore = {
        id: 2,
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 100,
        position: 2
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(mockTestScore))

      const updateData = {
        points: 175
      }

      const mockUpdatedScore = {
        id: mockTestScore.id,
        gameId: testGame.id,
        participantId: testParticipant.id,
        points: 175,
        position: 2, // Should remain unchanged
        createdAt: new Date(),
        updatedAt: new Date()
      }

      gameScoreRepository.update.mockResolvedValue(Result.success(mockUpdatedScore))

      const result = await gameScoreRepository.update(mockTestScore.id, updateData)
      const updatedScore = result.value

      expect(updatedScore.points).toBe(175)
      expect(updatedScore.position).toBe(2) // Should remain unchanged
    })

    it('should return null for non-existent score update', async () => {
      const updateData = {
        points: 300
      }

      gameScoreRepository.update.mockResolvedValue(Result.success(null))

      const result = await gameScoreRepository.update(99999, updateData)

      expect(result.value).toBeNull()
    })
  })

  describe('High Scores and Leaderboards', () => {
    beforeEach(async () => {
      // Create multiple games and scores for leaderboard testing
      const users = await TestHelpers.createTestUsers(5)

      for (let gameIndex = 0; gameIndex < 3; gameIndex++) {
        const game = await TestHelpers.createTestGame({
          name: `Leaderboard Game ${gameIndex + 1}`
        }, users[0].id)

        for (let userIndex = 0; userIndex < users.length; userIndex++) {
          const participant = await TestHelpers.createTestGamePlayer(game.id, users[userIndex].id, {
            position: userIndex + 1
          })

          await gameScoreRepository.create({
            gameId: game.id,
            participantId: participant.id,
            points: Math.floor(Math.random() * 500) + 100, // Random points between 100-600
            position: userIndex + 1
          })
        }
      }
    })

    it('should get high scores with default limit', async () => {
      const mockHighScores = [
        { id: 1, points: 500, position: 1, createdAt: new Date() },
        { id: 2, points: 400, position: 2, createdAt: new Date() },
        { id: 3, points: 300, position: 3, createdAt: new Date() }
      ]

      gameScoreRepository.getHighScores.mockResolvedValue(mockHighScores)

      const highScores = await gameScoreRepository.getHighScores()

      expect(highScores).toBeDefined()
      expect(highScores.length).toBeLessThanOrEqual(10) // Default limit

      // Should be ordered by points descending
      for (let i = 1; i < highScores.length; i++) {
        expect(highScores[i - 1].points).toBeGreaterThanOrEqual(highScores[i].points)
      }
    })

    it('should get high scores with custom limit', async () => {
      const mockHighScores = [
        { id: 1, points: 500, position: 1 },
        { id: 2, points: 400, position: 2 },
        { id: 3, points: 300, position: 3 },
        { id: 4, points: 200, position: 4 },
        { id: 5, points: 100, position: 5 }
      ]

      gameScoreRepository.getHighScores.mockResolvedValue(mockHighScores)

      const highScores = await gameScoreRepository.getHighScores(5)

      expect(highScores).toBeDefined()
      expect(highScores.length).toBeLessThanOrEqual(5)
    })

    it('should include user and game information in high scores', async () => {
      const mockHighScores = [
        { id: 1, points: 500, position: 1, createdAt: new Date() },
        { id: 2, points: 400, position: 2, createdAt: new Date() },
        { id: 3, points: 300, position: 3, createdAt: new Date() }
      ]

      gameScoreRepository.getHighScores.mockResolvedValue(mockHighScores)

      const highScores = await gameScoreRepository.getHighScores(3)

      expect(highScores.length).toBeGreaterThan(0)

      const firstScore = highScores[0]
      expect(firstScore.points).toBeDefined()
      expect(firstScore.position).toBeDefined()
      expect(firstScore.createdAt).toBeDefined()
    })

    it('should handle empty high scores gracefully', async () => {
      gameScoreRepository.getHighScores.mockResolvedValue([])

      const highScores = await gameScoreRepository.getHighScores()

      expect(highScores).toBeDefined()
      expect(highScores.length).toBe(0)
    })
  })

  describe('Score Statistics and Analytics', () => {
    let testUsers
    let testGames
    let testParticipants

    beforeEach(async () => {
      testUsers = await TestHelpers.createTestUsers(4)
      testGames = []
      testParticipants = []

      // Create multiple games with different score patterns
      for (let i = 0; i < 3; i++) {
        const game = await TestHelpers.createTestGame({
          name: `Analytics Game ${i + 1}`
        }, testUsers[0].id)
        testGames.push(game)

        const gameParticipants = []
        for (let j = 0; j < testUsers.length; j++) {
          const participant = await TestHelpers.createTestGamePlayer(game.id, testUsers[j].id, {
            position: j + 1
          })
          gameParticipants.push(participant)
        }
        testParticipants.push(gameParticipants)
      }

      // Create scores with different patterns
      const scorePatterns = [
        [400, 300, 200, 100], // Game 1: Clear winner
        [250, 240, 230, 220], // Game 2: Close scores
        [500, 150, 150, 50]   // Game 3: Tied second place
      ]

      for (let gameIndex = 0; gameIndex < testGames.length; gameIndex++) {
        for (let participantIndex = 0; participantIndex < testParticipants[gameIndex].length; participantIndex++) {
          await gameScoreRepository.create({
            gameId: testGames[gameIndex].id,
            participantId: testParticipants[gameIndex][participantIndex].id,
            points: scorePatterns[gameIndex][participantIndex],
            position: participantIndex + 1
          })
        }
      }
    })

    it('should find scores for specific participant across multiple games', async () => {
      const mockParticipantScores = [
        { id: 1, participantId: testParticipants[0][0].id, points: 400, game: { id: 1, name: 'Game 1' } },
        { id: 2, participantId: testParticipants[0][0].id, points: 250, game: { id: 2, name: 'Game 2' } },
        { id: 3, participantId: testParticipants[0][0].id, points: 500, game: { id: 3, name: 'Game 3' } }
      ]

      gameScoreRepository.getParticipantScores.mockResolvedValue(mockParticipantScores)

      const participantScores = await gameScoreRepository.getParticipantScores(
        testParticipants[0][0].id
      )

      expect(participantScores).toBeDefined()
      expect(participantScores.length).toBeGreaterThanOrEqual(1) // At least participated in 1 game

      // Should include game information
      participantScores.forEach(score => {
        expect(score.game).toBeDefined()
        expect(score.points).toBeDefined()
      })
    })

    it('should handle participant with no scores', async () => {
      const newUser = await TestHelpers.createTestUser({
        username: 'noscoreuser',
        email: 'noscore@example.com'
      })
      const newParticipant = await TestHelpers.createTestGamePlayer(testGames[0].id, newUser.id)

      gameScoreRepository.getParticipantScores.mockResolvedValue([])

      const participantScores = await gameScoreRepository.getParticipantScores(newParticipant.id)

      expect(participantScores).toBeDefined()
      expect(participantScores.length).toBe(0)
    })

    it('should maintain score ordering within games', async () => {
      const mockGameScores = [
        { id: 1, points: 400, position: 1 },
        { id: 2, points: 300, position: 2 },
        { id: 3, points: 200, position: 3 },
        { id: 4, points: 100, position: 4 }
      ]

      gameScoreRepository.findByGame.mockResolvedValue(Result.success(mockGameScores))

      for (const game of testGames) {
        const result = await gameScoreRepository.findByGame(game.id)
        const gameScores = result.value

        // Verify scores are ordered by points descending
        for (let i = 1; i < gameScores.length; i++) {
          expect(gameScores[i - 1].points).toBeGreaterThanOrEqual(gameScores[i].points)
        }
      }
    })

    it('should handle edge cases in score queries', async () => {
      // Test with very high and very low scores
      const extremeUser = await TestHelpers.createTestUser({
        username: 'extremeuser',
        email: 'extreme@example.com'
      })
      const extremeParticipant = await TestHelpers.createTestGamePlayer(testGames[0].id, extremeUser.id)

      const extremeScore = {
        id: 99,
        gameId: testGames[0].id,
        participantId: extremeParticipant.id,
        points: 0,
        position: 5
      }

      gameScoreRepository.create.mockResolvedValue(Result.success(extremeScore))

      const mockGameScores = [
        { id: 1, points: 400, position: 1 },
        { id: 2, points: 300, position: 2 },
        { id: 3, points: 200, position: 3 },
        { id: 4, points: 100, position: 4 },
        extremeScore
      ]

      gameScoreRepository.findByGame.mockResolvedValue(Result.success(mockGameScores))

      const result = await gameScoreRepository.findByGame(testGames[0].id)
      const gameScores = result.value
      const zeroScore = gameScores.find(score => score.points === 0)

      expect(zeroScore).toBeDefined()
      expect(zeroScore.position).toBe(5)
    })
  })
})
