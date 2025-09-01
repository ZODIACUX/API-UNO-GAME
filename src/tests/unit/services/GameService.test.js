const LegacyGameService = require('../../../src/services/GameService')
const Result = require('../../../src/core/errors/Result')

// Mock the dependencies
jest.mock('../../../src/repositories/GameRepository')
jest.mock('../../../src/repositories/userRepository')

describe('LegacyGameService', () => {
  let gameService
  let mockGameRepository

  beforeEach(() => {
    mockGameRepository = {
      getGamePlayers: jest.fn()
    }

    // Mock the parent class methods
    LegacyGameService.prototype.getGameState = jest.fn()

    gameService = new LegacyGameService()
    gameService.repository = mockGameRepository
  })

  describe('getTopCard', () => {
    it('should return top card when game state is successful', async () => {
      const gameId = 1
      const mockGameState = { topCard: 'Red 5' }

      gameService.getGameState.mockResolvedValue(Result.success(mockGameState))

      const result = await gameService.getTopCard(gameId)

      expect(gameService.getGameState).toHaveBeenCalledWith(gameId)
      expect(result).toEqual({
        game_id: gameId,
        top_card: 'Red 5'
      })
    })

    it('should return "No card" when topCard is not available', async () => {
      const gameId = 1
      const mockGameState = {}

      gameService.getGameState.mockResolvedValue(Result.success(mockGameState))

      const result = await gameService.getTopCard(gameId)

      expect(result).toEqual({
        game_id: gameId,
        top_card: 'No card'
      })
    })

    it('should return error when getGameState fails', async () => {
      const gameId = 1
      const errorResult = Result.failure(new Error('Game not found'))

      gameService.getGameState.mockResolvedValue(errorResult)

      const result = await gameService.getTopCard(gameId)

      expect(result).toBe(errorResult)
    })
  })

  describe('getScores', () => {
    it('should return scores for all players', async () => {
      const gameId = 1
      const mockPlayers = [
        { user: { username: 'player1' }, score: 100 },
        { user: { username: 'player2' }, score: 200 }
      ]

      mockGameRepository.getGamePlayers.mockResolvedValue(Result.success(mockPlayers))

      const result = await gameService.getScores(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: gameId,
        scores: {
          player1: 100,
          player2: 200
        }
      })
    })

    it('should handle players with no score', async () => {
      const gameId = 1
      const mockPlayers = [
        { user: { username: 'player1' }, score: null },
        { user: { username: 'player2' } } // no score property
      ]

      mockGameRepository.getGamePlayers.mockResolvedValue(Result.success(mockPlayers))

      const result = await gameService.getScores(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: gameId,
        scores: {
          player1: 0,
          player2: 0
        }
      })
    })

    it('should fail when gameId is not provided', async () => {
      const result = await gameService.getScores(null)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Game ID is required')
    })

    it('should fail when getGamePlayers fails', async () => {
      const gameId = 1

      mockGameRepository.getGamePlayers.mockResolvedValue(Result.failure(new Error('Database error')))

      const result = await gameService.getScores(gameId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Failed to get game players')
    })

    it('should handle empty players list', async () => {
      const gameId = 1
      const mockPlayers = []

      mockGameRepository.getGamePlayers.mockResolvedValue(Result.success(mockPlayers))

      const result = await gameService.getScores(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: gameId,
        scores: {}
      })
    })
  })

  describe('constructor', () => {
    it('should initialize with repositories', () => {
      const service = new LegacyGameService()
      expect(service).toBeInstanceOf(LegacyGameService)
    })
  })
})
