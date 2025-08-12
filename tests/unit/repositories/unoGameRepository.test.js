const unoGameRepository = require('../../../src/repositories/unoGameRepository')
const TestHelpers = require('../../helpers/testHelpers')

describe('UnoGameRepository CRUD Operations', () => {
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

      const createdGame = await unoGameRepository.create(gameData)

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

      const createdGame = await unoGameRepository.create(gameData)

      expect(createdGame.status).toBe('waiting')
      expect(createdGame.maxPlayers).toBe(4)
      expect(createdGame.direction).toBe('clockwise')
    })

    it('should fail to create game without required fields', async () => {
      const gameData = {
        name: 'Incomplete Game'
        // Missing creatorId
      }

      await expect(unoGameRepository.create(gameData)).rejects.toThrow()
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
      const foundGame = await unoGameRepository.findById(testGame.id)

      expect(foundGame).toBeDefined()
      expect(foundGame.id).toBe(testGame.id)
      expect(foundGame.name).toBe(testGame.name)
      expect(foundGame.creatorId).toBe(testUser.id)
    })

    it('should return null for non-existent game ID', async () => {
      const foundGame = await unoGameRepository.findById(99999)

      expect(foundGame).toBeNull()
    })

    it('should find all games', async () => {
      await TestHelpers.createTestGame({
        name: 'Second Game'
      }, testUser.id)

      const games = await unoGameRepository.findAll()

      expect(games).toBeDefined()
      expect(games.length).toBeGreaterThanOrEqual(2)
    })

    it('should find games by status', async () => {
      await TestHelpers.createTestGame({
        name: 'In Progress Game',
        status: 'in_progress'
      }, testUser.id)

      const waitingGames = await unoGameRepository.findByStatus('waiting')
      const inProgressGames = await unoGameRepository.findByStatus('in_progress')

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

      const userGames = await unoGameRepository.findByCreator(testUser.id)

      expect(userGames.length).toBeGreaterThanOrEqual(1)
      expect(userGames.every(game => game.creatorId === testUser.id)).toBe(true)
    })

    it('should find active games', async () => {
      await TestHelpers.createTestGame({
        name: 'Active Game 1',
        status: 'waiting'
      }, testUser.id)
      await TestHelpers.createTestGame({
        name: 'Active Game 2',
        status: 'in_progress'
      }, testUser.id)
      await TestHelpers.createTestGame({
        name: 'Finished Game',
        status: 'finished'
      }, testUser.id)

      const activeGames = await unoGameRepository.findActiveGames()

      expect(activeGames.length).toBeGreaterThanOrEqual(3) // Including the beforeEach game
      expect(activeGames.every(game =>
        game.status === 'waiting' || game.status === 'in_progress'
      )).toBe(true)
    })

    it('should get game with full details', async () => {
      const gameWithDetails = await unoGameRepository.getGameWithFullDetails(testGame.id)

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

      const updatedGame = await unoGameRepository.update(testGame.id, updateData)

      expect(updatedGame).toBeDefined()
      expect(updatedGame.name).toBe(updateData.name)
      expect(updatedGame.status).toBe(updateData.status)
      expect(updatedGame.direction).toBe(updateData.direction)
    })

    it('should update partial game data', async () => {
      const updateData = {
        status: 'finished'
      }

      const updatedGame = await unoGameRepository.update(testGame.id, updateData)

      expect(updatedGame.status).toBe('finished')
      expect(updatedGame.name).toBe(testGame.name) // Should remain unchanged
    })

    it('should update game with top card', async () => {
      const topCard = {
        color: 'red',
        type: 'number',
        value: '5'
      }

      const updatedGame = await unoGameRepository.update(testGame.id, {
        topCard: JSON.stringify(topCard)
      })

      expect(updatedGame.topCard).toBeDefined()
    })

    it('should return null for non-existent game update', async () => {
      const updateData = {
        name: 'Non-existent Game'
      }

      const result = await unoGameRepository.update(99999, updateData)

      expect(result).toBeNull()
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
      const result = await unoGameRepository.delete(testGame.id)

      expect(result).toBe(true)

      const deletedGame = await unoGameRepository.findById(testGame.id)
      expect(deletedGame).toBeNull()
    })

    it('should return false for non-existent game deletion', async () => {
      const result = await unoGameRepository.delete(99999)

      expect(result).toBe(false)
    })

    it('should not affect other games when deleting one game', async () => {
      const anotherGame = await TestHelpers.createTestGame({
        name: 'Keep This Game'
      }, testUser.id)

      const result = await unoGameRepository.delete(testGame.id)

      expect(result).toBe(true)

      const remainingGame = await unoGameRepository.findById(anotherGame.id)
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

      const topGames = await unoGameRepository.getTopGames(5)

      expect(topGames).toBeDefined()
      expect(topGames.length).toBeGreaterThanOrEqual(3)

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

      const topGames = await unoGameRepository.getTopGames(3)

      expect(topGames.length).toBeLessThanOrEqual(3)
    })

    it('should handle empty results for status queries', async () => {
      const nonExistentStatusGames = await unoGameRepository.findByStatus('non_existent_status')

      expect(nonExistentStatusGames).toBeDefined()
      expect(nonExistentStatusGames.length).toBe(0)
    })

    it('should handle empty results for creator queries', async () => {
      const nonExistentCreatorGames = await unoGameRepository.findByCreator(99999)

      expect(nonExistentCreatorGames).toBeDefined()
      expect(nonExistentCreatorGames.length).toBe(0)
    })
  })
})
