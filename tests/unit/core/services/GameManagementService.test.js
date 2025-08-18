const GameManagementService = require('../../../../src/core/services/GameManagementService')
const Result = require('../../../../src/core/errors/Result')

describe('GameManagementService', () => {
  let gameManagementService
  let mockGameRepository
  let mockParticipantRepository

  beforeEach(() => {
    mockGameRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    }

    mockParticipantRepository = {
      create: jest.fn(),
      findBy: jest.fn(),
      delete: jest.fn()
    }

    gameManagementService = new GameManagementService(mockGameRepository, mockParticipantRepository)
  })

  describe('createGame', () => {
    it('should create game successfully', async () => {
      const gameData = { name: 'Test Game', rules: 'Test rules' }
      const creatorId = 1
      const creatorUsername = 'testuser'

      const mockGame = { id: 1, name: 'Test Game', creatorId: 1 }
      const mockParticipant = { id: 1, gameId: 1, userId: 1, username: 'testuser' }

      mockGameRepository.create.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.create.mockResolvedValue(Result.success(mockParticipant))

      const result = await gameManagementService.createGame(gameData, creatorId, creatorUsername)

      expect(result.isSuccess).toBe(true)
      expect(result.value.id).toBe(1)
      expect(mockGameRepository.create).toHaveBeenCalledWith({
        name: 'Test Game',
        rules: 'Test rules',
        creatorId: 1,
        status: 'waiting',
        gameData: {
          deck: expect.any(Array),
          players: {}
        }
      })
    })

    it('should use default rules when not provided', async () => {
      const gameData = { name: 'Test Game' }
      const creatorId = 1
      const creatorUsername = 'testuser'

      const mockGame = { id: 1, name: 'Test Game', creatorId: 1 }
      const mockParticipant = { id: 1, gameId: 1, userId: 1, username: 'testuser' }

      mockGameRepository.create.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.create.mockResolvedValue(Result.success(mockParticipant))

      const result = await gameManagementService.createGame(gameData, creatorId, creatorUsername)

      expect(result.isSuccess).toBe(true)
      expect(mockGameRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: 'Standard UNO rules apply'
        })
      )
    })

    it('should fail when game creation fails', async () => {
      const gameData = { name: 'Test Game' }
      const creatorId = 1
      const creatorUsername = 'testuser'

      mockGameRepository.create.mockResolvedValue(Result.failure(new Error('Database error')))

      const result = await gameManagementService.createGame(gameData, creatorId, creatorUsername)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Failed to create game')
    })

    it('should fail when participant creation fails', async () => {
      const gameData = { name: 'Test Game' }
      const creatorId = 1
      const creatorUsername = 'testuser'

      const mockGame = { id: 1, name: 'Test Game', creatorId: 1 }

      mockGameRepository.create.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.create.mockResolvedValue(Result.failure(new Error('Participant error')))

      const result = await gameManagementService.createGame(gameData, creatorId, creatorUsername)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Failed to add creator as participant')
    })
  })

  describe('joinGame', () => {
    it('should join game successfully', async () => {
      const gameId = 1
      const userId = 2
      const username = 'player2'

      const mockGame = { id: 1, status: 'waiting' }
      const mockParticipant = { id: 2, gameId: 1, userId: 2, username: 'player2' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.findBy.mockResolvedValue(Result.success(null))
      mockParticipantRepository.create.mockResolvedValue(Result.success(mockParticipant))

      const result = await gameManagementService.joinGame(gameId, userId, username)

      expect(result.isSuccess).toBe(true)
      expect(result.value.username).toBe('player2')
    })

    it('should fail when game not found', async () => {
      const gameId = 999
      const userId = 2
      const username = 'player2'

      mockGameRepository.findById.mockResolvedValue(Result.failure(new Error('Not found')))

      const result = await gameManagementService.joinGame(gameId, userId, username)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Game not found')
    })

    it('should fail when game already started', async () => {
      const gameId = 1
      const userId = 2
      const username = 'player2'

      const mockGame = { id: 1, status: 'in_progress' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.joinGame(gameId, userId, username)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Game already started or finished')
    })

    it('should fail when user already in game', async () => {
      const gameId = 1
      const userId = 2
      const username = 'player2'

      const mockGame = { id: 1, status: 'waiting' }
      const existingParticipant = { id: 1, gameId: 1, userId: 2 }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.findBy.mockResolvedValue(Result.success(existingParticipant))

      const result = await gameManagementService.joinGame(gameId, userId, username)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User already in game')
    })
  })

  describe('startGame', () => {
    it('should start game successfully', async () => {
      const gameId = 1
      const userId = 1

      const mockGame = { id: 1, creatorId: 1, status: 'waiting' }
      const mockParticipants = [
        { username: 'player1' },
        { username: 'player2' }
      ]

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))
      mockGameRepository.update.mockResolvedValue(Result.success(true))

      const result = await gameManagementService.startGame(gameId, userId)

      expect(result.isSuccess).toBe(true)
      expect(mockGameRepository.update).toHaveBeenCalledWith(gameId, {
        status: 'in_progress',
        currentPlayer: 'player1'
      })
    })

    it('should fail when game not found', async () => {
      const gameId = 999
      const userId = 1

      mockGameRepository.findById.mockResolvedValue(Result.failure(new Error('Not found')))

      const result = await gameManagementService.startGame(gameId, userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Game not found')
    })

    it('should fail when user is not creator', async () => {
      const gameId = 1
      const userId = 2

      const mockGame = { id: 1, creatorId: 1, status: 'waiting' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.startGame(gameId, userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Only game creator can start the game')
    })

    it('should fail when not enough players', async () => {
      const gameId = 1
      const userId = 1

      const mockGame = { id: 1, creatorId: 1, status: 'waiting' }
      const mockParticipants = [{ username: 'player1' }]

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))

      const result = await gameManagementService.startGame(gameId, userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Need at least 2 players to start')
    })
  })

  describe('endGame', () => {
    it('should end game successfully', async () => {
      const gameId = 1
      const userId = 1

      const mockGame = { id: 1, creatorId: 1 }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockGameRepository.update.mockResolvedValue(Result.success(true))

      const result = await gameManagementService.endGame(gameId, userId)

      expect(result.isSuccess).toBe(true)
      expect(mockGameRepository.update).toHaveBeenCalledWith(gameId, {
        status: 'finished'
      })
    })

    it('should fail when user is not creator', async () => {
      const gameId = 1
      const userId = 2

      const mockGame = { id: 1, creatorId: 1 }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.endGame(gameId, userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Only game creator can end the game')
    })
  })

  describe('leaveGame', () => {
    it('should leave game successfully', async () => {
      const gameId = 1
      const userId = 2

      mockParticipantRepository.delete.mockResolvedValue(Result.success(true))

      const result = await gameManagementService.leaveGame(gameId, userId)

      expect(result.isSuccess).toBe(true)
      expect(mockParticipantRepository.delete).toHaveBeenCalledWith({
        gameId: 1,
        userId: 2
      })
    })

    it('should fail when user not in game', async () => {
      const gameId = 1
      const userId = 2

      mockParticipantRepository.delete.mockResolvedValue(Result.failure(new Error('Not found')))

      const result = await gameManagementService.leaveGame(gameId, userId)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User not in game')
    })
  })

  describe('getGameState', () => {
    it('should get game state successfully', async () => {
      const gameId = 1
      const mockGame = { id: 1, status: 'in_progress' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.getGameState(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: 1,
        state: 'in_progress'
      })
    })
  })

  describe('getGamePlayers', () => {
    it('should get game players successfully', async () => {
      const gameId = 1
      const mockParticipants = [
        { username: 'player1' },
        { username: 'player2' }
      ]

      mockParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))

      const result = await gameManagementService.getGamePlayers(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: 1,
        players: ['player1', 'player2']
      })
    })

    it('should handle empty participants array', async () => {
      const gameId = 1

      mockParticipantRepository.findBy.mockResolvedValue(Result.success([]))

      const result = await gameManagementService.getGamePlayers(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.players).toEqual([])
    })

    it('should handle non-array participants', async () => {
      const gameId = 1

      mockParticipantRepository.findBy.mockResolvedValue(Result.success(null))

      const result = await gameManagementService.getGamePlayers(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.players).toEqual([])
    })
  })

  describe('getCurrentPlayer', () => {
    it('should get current player successfully', async () => {
      const gameId = 1
      const mockGame = { id: 1, currentPlayer: 'player1' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.getCurrentPlayer(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: 1,
        current_player: 'player1'
      })
    })

    it('should use default player when currentPlayer is null', async () => {
      const gameId = 1
      const mockGame = { id: 1, currentPlayer: null }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.getCurrentPlayer(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.current_player).toBe('Player1')
    })
  })

  describe('getTopCard', () => {
    it('should get top card successfully', async () => {
      const gameId = 1
      const mockGame = { id: 1, topCard: 'Red 7' }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.getTopCard(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: 1,
        top_card: 'Red 7'
      })
    })

    it('should use default card when topCard is null', async () => {
      const gameId = 1
      const mockGame = { id: 1, topCard: null }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await gameManagementService.getTopCard(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.top_card).toBe('Ace of Spades')
    })
  })

  describe('getScores', () => {
    it('should get scores successfully', async () => {
      const gameId = 1
      const mockParticipants = [
        { username: 'player1', score: 100 },
        { username: 'player2', score: 50 }
      ]

      mockParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))

      const result = await gameManagementService.getScores(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toEqual({
        game_id: 1,
        scores: {
          player1: 100,
          player2: 50
        }
      })
    })

    it('should handle participants without scores', async () => {
      const gameId = 1
      const mockParticipants = [
        { username: 'player1' },
        { username: 'player2' }
      ]

      mockParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))

      const result = await gameManagementService.getScores(gameId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.scores).toEqual({
        player1: 0,
        player2: 0
      })
    })
  })

  describe('generateDeck', () => {
    it('should generate a complete UNO deck', () => {
      const deck = gameManagementService.generateDeck()

      expect(deck).toHaveLength(108) // Standard UNO deck size
      expect(deck).toContain('Red 0')
      expect(deck).toContain('Blue Skip')
      expect(deck).toContain('Wild')
      expect(deck).toContain('Wild Draw Four')
    })
  })

  describe('shuffleDeck', () => {
    it('should shuffle deck maintaining same length', () => {
      const originalDeck = ['Card1', 'Card2', 'Card3', 'Card4', 'Card5']
      const shuffledDeck = gameManagementService.shuffleDeck([...originalDeck])

      expect(shuffledDeck).toHaveLength(originalDeck.length)
      expect(shuffledDeck).toEqual(expect.arrayContaining(originalDeck))
    })
  })
})
