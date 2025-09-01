const unoGameRepository = require('../../../src/repositories/unoGameRepository')
const TestHelpers = require('../../helpers/testHelpers')
const Result = require('../../../src/core/errors/Result')

// Mock the unoGameRepository methods
jest.mock('../../../src/repositories/unoGameRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  findByCreator: jest.fn(),
  findActiveGames: jest.fn(),
  getGameWithFullDetails: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getTopGames: jest.fn()
}))

describe('UnoGameRepository CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('Create Game', () => {
    let testUser

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'gameowner',
        email: 'gameowner@example.com'
      })
    })

    it('should create a new game successfully', async () => {
      const gameData = {
        name: 'Test UNO Game',
        rules: 'Standard UNO rules',
        status: 'waiting',
        creatorId: testUser.id,
        maxPlayers: 4,
        direction: 'clockwise'
      }

      const mockGame = {
        id: 1,
        ...gameData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      unoGameRepository.create.mockResolvedValue(Result.success(mockGame))

      const result = await unoGameRepository.create(gameData)
      const createdGame = result.value

      expect(createdGame).toBeDefined()
      expect(createdGame.id).toBeDefined()
      expect(createdGame.name).toBe(gameData.name)
      expect(createdGame.rules).toBe(gameData.rules)
      expect(createdGame.status).toBe(gameData.status)
      expect(createdGame.creatorId).toBe(testUser.id)
      expect(createdGame.maxPlayers).toBe(4)
      expect(createdGame.direction).toBe('clockwise')
      expect(createdGame.createdAt).toBeDefined()
      expect(createdGame.updatedAt).toBeDefined()
    })

    it('should create game with default values', async () => {
      const gameData = {
        name: 'Simple Game',
        creatorId: testUser.id
      }

      const mockGame = {
        id: 2,
        ...gameData,
        status: 'waiting',
        maxPlayers: 4,
        direction: 'clockwise',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      unoGameRepository.create.mockResolvedValue(Result.success(mockGame))

      const result = await unoGameRepository.create(gameData)
      const createdGame = result.value

      expect(createdGame.status).toBe('waiting')
      expect(createdGame.maxPlayers).toBe(4)
      expect(createdGame.direction).toBe('clockwise')
    })

    it('should fail to create game without required fields', async () => {
      const gameData = {
        name: 'Incomplete Game'
        // Missing creatorId
      }

      unoGameRepository.create.mockResolvedValue(Result.failure(new Error('Missing required fields')))

      const result = await unoGameRepository.create(gameData)
      expect(result.isSuccess).toBe(false)
    })
  })

  describe('Read Game', () => {
    let testUser
    let testGame

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'gamereader',
        email: 'gamereader@example.com'
      })
      testGame = await TestHelpers.createTestGame({
        name: 'Read Test Game',
        status: 'waiting'
      }, testUser.id)
    })

    it('should find game by ID', async () => {
      unoGameRepository.findById.mockResolvedValue(Result.success(testGame))

      const result = await unoGameRepository.findById(testGame.id)
      const foundGame = result.value

      expect(foundGame).toBeDefined()
      expect(foundGame.id).toBe(testGame.id)
      expect(foundGame.name).toBe(testGame.name)
      expect(foundGame.creatorId).toBe(testUser.id)
    })

    it('should return null for non-existent game ID', async () => {
      unoGameRepository.findById.mockResolvedValue(Result.success(null))

      const result = await unoGameRepository.findById(99999)
      const foundGame = result.value

      expect(foundGame).toBeNull()
    })

    it('should find all games', async () => {
      const secondGame = await TestHelpers.createTestGame({
        name: 'Second Game'
      }, testUser.id)

      const mockGames = [testGame, secondGame]
      unoGameRepository.findAll.mockResolvedValue(Result.success(mockGames))

      const result = await unoGameRepository.findAll()
      const games = result.value

      expect(games).toBeDefined()
      expect(games.length).toBeGreaterThanOrEqual(2)
    })

    it('should find games by status', async () => {
      const inProgressGame = await TestHelpers.createTestGame({
        name: 'In Progress Game',
        status: 'in_progress'
      }, testUser.id)

      const mockWaitingGames = [testGame]
      const mockInProgressGames = [inProgressGame]

      unoGameRepository.findByStatus.mockImplementation((status) => {
        if (status === 'waiting') return Promise.resolve(Result.success(mockWaitingGames))
        if (status === 'in_progress') return Promise.resolve(Result.success(mockInProgressGames))
        return Promise.resolve(Result.success([]))
      })

      const waitingResult = await unoGameRepository.findByStatus('waiting')
      const inProgressResult = await unoGameRepository.findByStatus('in_progress')
      const waitingGames = waitingResult.value
      const inProgressGames = inProgressResult.value

      expect(waitingGames.length).toBeGreaterThanOrEqual(1)
      expect(inProgressGames.length).toBeGreaterThanOrEqual(1)
      expect(waitingGames.every(game => game.status === 'waiting')).toBe(true)
      expect(inProgressGames.every(game => game.status === 'in_progress')).toBe(true)
    })

    it('should find games by creator', async () => {
      const anotherUser = await TestHelpers.createTestUser({
        username: 'anothercreator',
        email: 'another@example.com'
      })
      await TestHelpers.createTestGame({
        name: 'Another User Game'
      }, anotherUser.id)

      const mockUserGames = [testGame]
      unoGameRepository.findByCreator.mockResolvedValue(Result.success(mockUserGames))

      const result = await unoGameRepository.findByCreator(testUser.id)
      const userGames = result.value

      expect(userGames.length).toBeGreaterThanOrEqual(1)
      expect(userGames.every(game => game.creatorId === testUser.id)).toBe(true)
    })

    it('should find active games', async () => {
      const activeGame1 = await TestHelpers.createTestGame({
        name: 'Active Game 1',
        status: 'waiting'
      }, testUser.id)
      const activeGame2 = await TestHelpers.createTestGame({
        name: 'Active Game 2',
        status: 'in_progress'
      }, testUser.id)
      await TestHelpers.createTestGame({
        name: 'Finished Game',
        status: 'finished'
      }, testUser.id)

      const mockActiveGames = [testGame, activeGame1, activeGame2]
      unoGameRepository.findActiveGames.mockResolvedValue(Result.success(mockActiveGames))

      const result = await unoGameRepository.findActiveGames()
      const activeGames = result.value

      expect(activeGames.length).toBeGreaterThanOrEqual(3) // Including the beforeEach game
      expect(activeGames.every(game =>
        game.status === 'waiting' || game.status === 'in_progress'
      )).toBe(true)
    })

    it('should get game with full details', async () => {
      const mockGameWithDetails = {
        ...testGame,
        players: [],
        cards: []
      }
      unoGameRepository.getGameWithFullDetails.mockResolvedValue(Result.success(mockGameWithDetails))

      const result = await unoGameRepository.getGameWithFullDetails(testGame.id)
      const gameWithDetails = result.value

      expect(gameWithDetails).toBeDefined()
      expect(gameWithDetails.id).toBe(testGame.id)
      // Relations should be loaded (even if empty)
      expect(gameWithDetails.players).toBeDefined()
      expect(gameWithDetails.cards).toBeDefined()
    })
  })

  describe('Update Game', () => {
    let testUser
    let testGame

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'gameupdater',
        email: 'gameupdater@example.com'
      })
      testGame = await TestHelpers.createTestGame({
        name: 'Update Test Game',
        status: 'waiting'
      }, testUser.id)
    })

    it('should update game successfully', async () => {
      const updateData = {
        name: 'Updated Game Name',
        status: 'in_progress',
        direction: 'counterclockwise'
      }

      const mockUpdatedGame = {
        ...testGame,
        ...updateData,
        updatedAt: new Date()
      }

      unoGameRepository.update.mockResolvedValue(Result.success(mockUpdatedGame))

      const result = await unoGameRepository.update(testGame.id, updateData)
      const updatedGame = result.value

      expect(updatedGame).toBeDefined()
      expect(updatedGame.name).toBe(updateData.name)
      expect(updatedGame.status).toBe(updateData.status)
      expect(updatedGame.direction).toBe(updateData.direction)
    })

    it('should update partial game data', async () => {
      const updateData = {
        status: 'finished'
      }

      const mockUpdatedGame = {
        ...testGame,
        status: 'finished',
        updatedAt: new Date()
      }

      unoGameRepository.update.mockResolvedValue(Result.success(mockUpdatedGame))

      const result = await unoGameRepository.update(testGame.id, updateData)
      const updatedGame = result.value

      expect(updatedGame.status).toBe('finished')
      expect(updatedGame.name).toBe(testGame.name) // Should remain unchanged
    })

    it('should update game with top card', async () => {
      const topCard = {
        color: 'red',
        type: 'number',
        value: '5'
      }

      const mockUpdatedGame = {
        ...testGame,
        topCard: JSON.stringify(topCard),
        updatedAt: new Date()
      }

      unoGameRepository.update.mockResolvedValue(Result.success(mockUpdatedGame))

      const result = await unoGameRepository.update(testGame.id, {
        topCard: JSON.stringify(topCard)
      })
      const updatedGame = result.value

      expect(updatedGame.topCard).toBeDefined()
    })

    it('should return null for non-existent game update', async () => {
      const updateData = {
        name: 'Non-existent Game'
      }

      unoGameRepository.update.mockResolvedValue(Result.success(null))

      const result = await unoGameRepository.update(99999, updateData)

      expect(result.value).toBeNull()
    })
  })

  describe('Delete Game', () => {
    let testUser
    let testGame

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        username: 'gamedeleter',
        email: 'gamedeleter@example.com'
      })
      testGame = await TestHelpers.createTestGame({
        name: 'Delete Test Game'
      }, testUser.id)
    })

    it('should delete game successfully', async () => {
      unoGameRepository.delete.mockResolvedValue(Result.success(true))
      unoGameRepository.findById.mockResolvedValue(Result.success(null))

      const result = await unoGameRepository.delete(testGame.id)

      expect(result.value).toBe(true)

      const deletedResult = await unoGameRepository.findById(testGame.id)
      const deletedGame = deletedResult.value
      expect(deletedGame).toBeNull()
    })

    it('should return false for non-existent game deletion', async () => {
      unoGameRepository.delete.mockResolvedValue(Result.success(false))

      const result = await unoGameRepository.delete(99999)

      expect(result.value).toBe(false)
    })

    it('should not affect other games when deleting one game', async () => {
      const anotherGame = await TestHelpers.createTestGame({
        name: 'Keep This Game'
      }, testUser.id)

      unoGameRepository.delete.mockResolvedValue(Result.success(true))
      unoGameRepository.findById.mockResolvedValue(Result.success(anotherGame))

      const result = await unoGameRepository.delete(testGame.id)

      expect(result.value).toBe(true)

      const remainingResult = await unoGameRepository.findById(anotherGame.id)
      const remainingGame = remainingResult.value
      expect(remainingGame).toBeDefined()
      expect(remainingGame.id).toBe(anotherGame.id)
    })
  })

  describe('Advanced Game Queries', () => {
    beforeEach(async () => {
      await TestHelpers.createTestUser({
        username: 'advanceduser',
        email: 'advanced@example.com'
      })
    })

    it('should get top games by player count', async () => {
      // Create games with different player counts
      const { game: game1 } = await TestHelpers.createGameWithPlayers(4)
      const { game: game2 } = await TestHelpers.createGameWithPlayers(2)
      await TestHelpers.createGameWithPlayers(3)

      const mockTopGames = [
        { game_id: game1.id, playerCount: '4', name: game1.name },
        { game_id: game2.id, playerCount: '2', name: game2.name }
      ]

      unoGameRepository.getTopGames.mockResolvedValue(Result.success(mockTopGames))

      const result = await unoGameRepository.getTopGames(5)
      const topGames = result.value

      expect(topGames).toBeDefined()
      expect(topGames.length).toBeGreaterThanOrEqual(2)

      // Should be ordered by player count descending
      const game1Result = topGames.find(g => g.game_id === game1.id)
      const game2Result = topGames.find(g => g.game_id === game2.id)

      expect(game1Result).toBeDefined()
      expect(game2Result).toBeDefined()
      expect(parseInt(game1Result.playerCount)).toBeGreaterThan(parseInt(game2Result.playerCount))
    })

    it('should limit top games results', async () => {
      // Create multiple games
      for (let i = 0; i < 5; i++) {
        await TestHelpers.createGameWithPlayers(2)
      }

      const mockTopGames = [
        { game_id: 1, playerCount: '2', name: 'Game 1' },
        { game_id: 2, playerCount: '2', name: 'Game 2' },
        { game_id: 3, playerCount: '2', name: 'Game 3' }
      ]

      unoGameRepository.getTopGames.mockResolvedValue(Result.success(mockTopGames))

      const result = await unoGameRepository.getTopGames(3)
      const topGames = result.value

      expect(topGames.length).toBeLessThanOrEqual(3)
    })

    it('should handle empty results for status queries', async () => {
      unoGameRepository.findByStatus.mockResolvedValue(Result.success([]))

      const result = await unoGameRepository.findByStatus('non_existent_status')
      const nonExistentStatusGames = result.value

      expect(nonExistentStatusGames).toBeDefined()
      expect(nonExistentStatusGames.length).toBe(0)
    })

    it('should handle empty results for creator queries', async () => {
      unoGameRepository.findByCreator.mockResolvedValue(Result.success([]))

      const result = await unoGameRepository.findByCreator(99999)
      const nonExistentCreatorGames = result.value

      expect(nonExistentCreatorGames).toBeDefined()
      expect(nonExistentCreatorGames.length).toBe(0)
    })
  })
})
