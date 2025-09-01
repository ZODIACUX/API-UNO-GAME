const UnoGameService = require('../../../../src/core/services/UnoGameService')
const Result = require('../../../../src/core/errors/Result')

describe('UnoGameService', () => {
  let unoGameService
  let mockGameRepository
  let mockGameParticipantRepository
  let mockCardRepository

  beforeEach(() => {
    // Mock repositories
    mockGameRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    }

    mockGameParticipantRepository = {
      create: jest.fn(),
      findBy: jest.fn(),
      findOne: jest.fn()
    }

    mockCardRepository = {
      findBy: jest.fn()
    }

    // Create service instance
    unoGameService = new UnoGameService(
      mockGameRepository,
      mockGameParticipantRepository,
      mockCardRepository
    )
  })

  describe('createGame', () => {
    it('should create a new game successfully', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        creatorId: 1,
        status: 'waiting'
      }

      mockGameRepository.create.mockResolvedValue(mockGame)

      const result = await unoGameService.createGame('Test Game', 1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.id).toBe(1)
      expect(result.value.name).toBe('Test Game')
      expect(mockGameRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Game',
          creatorId: 1,
          status: 'waiting'
        })
      )
    })

    it('should handle game creation failure', async () => {
      mockGameRepository.create.mockRejectedValue(new Error('Database error'))

      const result = await unoGameService.createGame('Test Game', 1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Database error')
    })
  })

  describe('joinGame', () => {
    it('should allow user to join game successfully', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        creatorId: 1
      }

      const _mockUser = {
        id: 2,
        username: 'testuser'
      }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockGameParticipantRepository.findOne.mockResolvedValue(Result.failure(new Error('Not found')))
      mockGameParticipantRepository.create.mockResolvedValue(Result.success({}))

      const result = await unoGameService.joinGame(1, 2, 'testuser')

      expect(result.isSuccess).toBe(true)
      expect(result.value.message).toBe('User joined the game successfully')
    })

    it('should prevent joining game that is already started', async () => {
      const mockGame = {
        id: 1,
        status: 'in_progress',
        creatorId: 1
      }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await unoGameService.joinGame(1, 2, 'testuser')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Game already started')
    })

    it('should prevent user from joining game they are already in', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        creatorId: 1
      }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockGameParticipantRepository.findOne.mockResolvedValue(Result.success({ id: 1 }))

      const result = await unoGameService.joinGame(1, 2, 'testuser')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('User already in game')
    })
  })

  describe('startGame', () => {
    it('should start game successfully when creator initiates', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        creatorId: 1
      }

      const mockParticipants = [
        { id: 1, userId: 1, username: 'creator', isReady: true },
        { id: 2, userId: 2, username: 'player2', isReady: true }
      ]

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockGameParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))
      mockGameRepository.update.mockResolvedValue(Result.success({}))

      const result = await unoGameService.startGame(1, 1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.message).toBe('Game started successfully')
    })

    it('should prevent non-creator from starting game', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        creatorId: 1
      }

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))

      const result = await unoGameService.startGame(1, 2) // User 2 is not creator

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Only game creator can start the game')
    })

    it('should require at least 2 players to start', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        creatorId: 1
      }

      const mockParticipants = [
        { id: 1, userId: 1, username: 'creator', isReady: true }
      ]

      mockGameRepository.findById.mockResolvedValue(Result.success(mockGame))
      mockGameParticipantRepository.findBy.mockResolvedValue(Result.success(mockParticipants))

      const result = await unoGameService.startGame(1, 1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Need at least 2 players to start')
    })
  })

  describe('playCard', () => {
    beforeEach(() => {
      // Initialize game state
      unoGameService.gameStates.set(1, {
        deck: ['Red 5', 'Blue 3'],
        discardPile: ['Green 7'],
        players: new Map([
          [1, { id: 1, username: 'player1', cards: ['Red 7', 'Green 7'], isUno: false }],
          [2, { id: 2, username: 'player2', cards: ['Blue 2', 'Yellow 8'], isUno: false }]
        ]),
        currentPlayerIndex: 0,
        direction: 'clockwise',
        currentColor: 'green',
        currentValue: '7'
      })
    })

    it('should play valid card successfully', async () => {
      const result = await unoGameService.playCard(1, 1, 'Green 7')

      expect(result.isSuccess).toBe(true)
      expect(result.value.message).toBe('Card played successfully')
      expect(result.value.nextPlayer).toBe('player2')
    })

    it('should reject invalid card play', async () => {
      const result = await unoGameService.playCard(1, 1, 'Blue 2')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid card play')
    })

    it('should reject play when not player\'s turn', async () => {
      const result = await unoGameService.playCard(1, 2, 'Blue 2')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Not your turn')
    })

    it('should reject play when player doesn\'t have the card', async () => {
      const result = await unoGameService.playCard(1, 1, 'Blue 2')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Card not in player hand')
    })
  })

  describe('drawCard', () => {
    beforeEach(() => {
      unoGameService.gameStates.set(1, {
        deck: ['Red 5', 'Blue 3'],
        discardPile: ['Green 7'],
        players: new Map([
          [1, { id: 1, username: 'player1', cards: ['Red 7'], isUno: false }]
        ]),
        currentPlayerIndex: 0,
        direction: 'clockwise',
        currentColor: 'green',
        currentValue: '7'
      })
    })

    it('should draw card successfully', async () => {
      const result = await unoGameService.drawCard(1, 1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.message).toBe('Card drawn successfully')
      expect(result.value.drawnCard).toBe('Red 5')
    })

    it('should handle empty deck', async () => {
      unoGameService.gameStates.get(1).deck = []

      const result = await unoGameService.drawCard(1, 1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('No cards left in deck')
    })
  })

  describe('sayUno', () => {
    beforeEach(() => {
      unoGameService.gameStates.set(1, {
        players: new Map([
          [1, { id: 1, username: 'player1', cards: ['Red 7'], isUno: false }]
        ])
      })
    })

    it('should allow saying UNO with one card', async () => {
      const result = await unoGameService.sayUno(1, 1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.message).toBe('UNO said successfully')
    })

    it('should reject saying UNO with more than one card', async () => {
      unoGameService.gameStates.get(1).players.get(1).cards = ['Red 7', 'Blue 3']

      const result = await unoGameService.sayUno(1, 1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Can only say UNO when you have one card')
    })
  })

  describe('getGameState', () => {
    beforeEach(() => {
      unoGameService.gameStates.set(1, {
        currentPlayerIndex: 0,
        direction: 'clockwise',
        currentColor: 'green',
        currentValue: '7',
        topCard: 'Green 7',
        players: new Map([
          [1, { username: 'player1', cards: ['Red 7', 'Blue 3'], isUno: false }],
          [2, { username: 'player2', cards: ['Yellow 8'], isUno: true }]
        ])
      })

      mockGameRepository.findById.mockResolvedValue(Result.success({
        id: 1,
        status: 'in_progress'
      }))
    })

    it('should return game state successfully', async () => {
      const result = await unoGameService.getGameState(1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.gameId).toBe(1)
      expect(result.value.status).toBe('in_progress')
      expect(result.value.currentPlayer).toBe('player1')
      expect(result.value.currentColor).toBe('green')
      expect(result.value.players).toHaveLength(2)
    })
  })

  describe('getPlayerHand', () => {
    beforeEach(() => {
      unoGameService.gameStates.set(1, {
        players: new Map([
          [1, { id: 1, username: 'player1', cards: ['Red 7', 'Blue 3'] }]
        ])
      })
    })

    it('should return player hand successfully', async () => {
      const result = await unoGameService.getPlayerHand(1, 1)

      expect(result.isSuccess).toBe(true)
      expect(result.value.player).toBe('player1')
      expect(result.value.hand).toEqual(['Red 7', 'Blue 3'])
      expect(result.value.cardCount).toBe(2)
    })

    it('should reject request for non-existent player', async () => {
      const result = await unoGameService.getPlayerHand(1, 999)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Player not in game')
    })
  })

  describe('generateDeck', () => {
    it('should generate standard UNO deck', () => {
      const deck = unoGameService.generateDeck()

      expect(deck).toBeDefined()
      expect(deck.length).toBe(108) // Standard UNO deck size

      // Check for number cards
      expect(deck).toContain('Red 0')
      expect(deck).toContain('Blue 5')
      expect(deck).toContain('Green 9')

      // Check for special cards
      expect(deck).toContain('Red Skip')
      expect(deck).toContain('Blue Reverse')
      expect(deck).toContain('Green Draw Two')

      // Check for wild cards
      expect(deck).toContain('Wild')
      expect(deck).toContain('Wild Draw Four')
    })
  })

  describe('canPlayCard', () => {
    it('should allow playing card with same color', () => {
      const result = unoGameService.canPlayCard('Red 5', 'red', '7')
      expect(result).toBe(true)
    })

    it('should allow playing card with same value', () => {
      const result = unoGameService.canPlayCard('Blue 7', 'red', '7')
      expect(result).toBe(true)
    })

    it('should allow playing wild card', () => {
      const result = unoGameService.canPlayCard('Wild', 'red', '7')
      expect(result).toBe(true)
    })

    it('should reject playing invalid card', () => {
      const result = unoGameService.canPlayCard('Blue 5', 'red', '7')
      expect(result).toBe(false)
    })
  })

  describe('getCardColor', () => {
    it('should return correct color for regular cards', () => {
      expect(unoGameService.getCardColor('Red 5')).toBe('red')
      expect(unoGameService.getCardColor('Blue Skip')).toBe('blue')
      expect(unoGameService.getCardColor('Green Reverse')).toBe('green')
      expect(unoGameService.getCardColor('Yellow Draw Two')).toBe('yellow')
    })

    it('should return black for wild cards', () => {
      expect(unoGameService.getCardColor('Wild')).toBe('black')
      expect(unoGameService.getCardColor('Wild Draw Four')).toBe('black')
    })
  })

  describe('getCardValue', () => {
    it('should return correct value for regular cards', () => {
      expect(unoGameService.getCardValue('Red 5')).toBe('5')
      expect(unoGameService.getCardValue('Blue Skip')).toBe('Skip')
      expect(unoGameService.getCardValue('Green Reverse')).toBe('Reverse')
    })

    it('should return correct value for wild cards', () => {
      expect(unoGameService.getCardValue('Wild')).toBe('')
      expect(unoGameService.getCardValue('Wild Draw Four')).toBe('Draw Four')
    })
  })
})
