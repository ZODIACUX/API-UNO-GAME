const cardRepository = require('../../../src/repositories/cardRepository')
const Result = require('../../../src/core/errors/Result')

// Mock the cardRepository methods
jest.mock('../../../src/repositories/cardRepository', () => ({
  create: jest.fn(),
  createMany: jest.fn(),
  findById: jest.fn(),
  findByType: jest.fn(),
  findByColor: jest.fn(),
  findByValue: jest.fn(),
  findAll: jest.fn()
}))

describe('CardRepository CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('Create Card', () => {
    it('should create a single card successfully', async () => {
      const cardData = {
        color: 'red',
        type: 'number',
        value: '5'
      }

      const mockCard = {
        id: 1,
        ...cardData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      cardRepository.create.mockResolvedValue(Result.success(mockCard))

      const result = await cardRepository.create(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBeDefined()
      expect(result.value.color).toBe(cardData.color)
      expect(result.value.type).toBe(cardData.type)
      expect(result.value.value).toBe(cardData.value)
    })

    it('should create a wild card successfully', async () => {
      const cardData = {
        color: 'wild',
        type: 'wild',
        value: null
      }

      const mockCard = {
        id: 2,
        ...cardData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      cardRepository.create.mockResolvedValue(Result.success(mockCard))

      const result = await cardRepository.create(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.color).toBe('wild')
      expect(result.value.type).toBe('wild')
      expect(result.value.value).toBeNull()
    })

    it('should create an action card successfully', async () => {
      const cardData = {
        color: 'blue',
        type: 'skip',
        value: null
      }

      const mockCard = {
        id: 3,
        ...cardData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      cardRepository.create.mockResolvedValue(Result.success(mockCard))

      const result = await cardRepository.create(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.color).toBe('blue')
      expect(result.value.type).toBe('skip')
      expect(result.value.value).toBeNull()
    })

    it('should create multiple cards successfully', async () => {
      const cardsData = [
        { color: 'red', type: 'number', value: '1' },
        { color: 'blue', type: 'number', value: '2' },
        { color: 'green', type: 'skip', value: null },
        { color: 'yellow', type: 'reverse', value: null }
      ]

      const mockCards = cardsData.map((card, index) => ({
        id: index + 4,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      cardRepository.createMany.mockResolvedValue(Result.success(mockCards))

      const result = await cardRepository.createMany(cardsData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBe(4)
      expect(result.value[0].color).toBe('red')
      expect(result.value[1].color).toBe('blue')
      expect(result.value[2].type).toBe('skip')
      expect(result.value[3].type).toBe('reverse')
    })

    it('should fail to create card with invalid color', async () => {
      const cardData = {
        color: 'invalid_color',
        type: 'number',
        value: '5'
      }

      cardRepository.create.mockResolvedValue(Result.failure(new Error('Invalid color')))

      const result = await cardRepository.create(cardData)
      expect(result.isSuccess).toBe(false)
    })

    it('should fail to create card with invalid type', async () => {
      const cardData = {
        color: 'red',
        type: 'invalid_type',
        value: '5'
      }

      cardRepository.create.mockResolvedValue(Result.failure(new Error('Invalid type')))

      const result = await cardRepository.create(cardData)
      expect(result.isSuccess).toBe(false)
    })
  })

  describe('Read Card', () => {
    let testCards

    beforeEach(async () => {
      // Mock test cards for reading operations
      testCards = [
        { id: 1, color: 'red', type: 'number', value: '0' },
        { id: 2, color: 'red', type: 'number', value: '1' },
        { id: 3, color: 'blue', type: 'number', value: '2' },
        { id: 4, color: 'green', type: 'skip', value: null },
        { id: 5, color: 'yellow', type: 'reverse', value: null },
        { id: 6, color: 'red', type: 'draw_two', value: null },
        { id: 7, color: 'wild', type: 'wild', value: null },
        { id: 8, color: 'wild', type: 'wild_draw_four', value: null }
      ]

      cardRepository.createMany.mockResolvedValue(Result.success(testCards))
    })

    it('should find card by ID', async () => {
      cardRepository.findById.mockResolvedValue(Result.success(testCards[0]))

      const result = await cardRepository.findById(testCards[0].id)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.id).toBe(testCards[0].id)
      expect(result.value.color).toBe('red')
      expect(result.value.type).toBe('number')
      expect(result.value.value).toBe('0')
    })

    it('should return null for non-existent card ID', async () => {
      cardRepository.findById.mockResolvedValue(Result.success(null))

      const result = await cardRepository.findById(99999)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should find cards by type', async () => {
      const numberCards = testCards.filter(card => card.type === 'number')
      const wildCards = testCards.filter(card => card.type === 'wild')

      cardRepository.findByType.mockImplementation((type) => {
        if (type === 'number') return Promise.resolve(Result.success(numberCards))
        if (type === 'wild') return Promise.resolve(Result.success(wildCards))
        return Promise.resolve(Result.success([]))
      })

      const numberResult = await cardRepository.findByType('number')
      const wildResult = await cardRepository.findByType('wild')

      expect(numberResult.isSuccess).toBe(true)
      expect(wildResult.isSuccess).toBe(true)
      expect(numberResult.value.length).toBeGreaterThanOrEqual(3)
      expect(wildResult.value.length).toBeGreaterThanOrEqual(1)
      expect(numberResult.value.every(card => card.type === 'number')).toBe(true)
      expect(wildResult.value.every(card => card.type === 'wild')).toBe(true)
    })

    it('should find cards by color', async () => {
      const redCards = testCards.filter(card => card.color === 'red')
      const wildCards = testCards.filter(card => card.color === 'wild')

      cardRepository.findByColor.mockImplementation((color) => {
        if (color === 'red') return Promise.resolve(Result.success(redCards))
        if (color === 'wild') return Promise.resolve(Result.success(wildCards))
        return Promise.resolve(Result.success([]))
      })

      const redResult = await cardRepository.findByColor('red')
      const wildResult = await cardRepository.findByColor('wild')

      expect(redResult.isSuccess).toBe(true)
      expect(wildResult.isSuccess).toBe(true)
      expect(redResult.value.length).toBeGreaterThanOrEqual(3)
      expect(wildResult.value.length).toBeGreaterThanOrEqual(2)
      expect(redResult.value.every(card => card.color === 'red')).toBe(true)
      expect(wildResult.value.every(card => card.color === 'wild')).toBe(true)
    })

    it('should find cards by value', async () => {
      const value1Cards = testCards.filter(card => card.value === '1')
      const nullValueCards = testCards.filter(card => card.value === null)

      cardRepository.findByValue.mockImplementation((value) => {
        if (value === '1') return Promise.resolve(Result.success(value1Cards))
        if (value === null) return Promise.resolve(Result.success(nullValueCards))
        return Promise.resolve(Result.success([]))
      })

      const value1Result = await cardRepository.findByValue('1')
      const nullValueResult = await cardRepository.findByValue(null)

      expect(value1Result.isSuccess).toBe(true)
      expect(nullValueResult.isSuccess).toBe(true)
      expect(value1Result.value.length).toBeGreaterThanOrEqual(1)
      expect(nullValueResult.value.length).toBeGreaterThanOrEqual(4) // skip, reverse, draw_two, wild cards
      expect(value1Result.value.every(card => card.value === '1')).toBe(true)
      expect(nullValueResult.value.every(card => card.value === null)).toBe(true)
    })

    it('should find all cards', async () => {
      cardRepository.findAll.mockResolvedValue(Result.success(testCards))

      const result = await cardRepository.findAll()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBeGreaterThanOrEqual(8)
    })

    it('should return empty array for non-existent type', async () => {
      cardRepository.findByType.mockResolvedValue(Result.success([]))

      const result = await cardRepository.findByType('non_existent_type')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBe(0)
    })

    it('should return empty array for non-existent color', async () => {
      cardRepository.findByColor.mockResolvedValue(Result.success([]))

      const result = await cardRepository.findByColor('non_existent_color')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBe(0)
    })

    it('should return empty array for non-existent value', async () => {
      cardRepository.findByValue.mockResolvedValue(Result.success([]))

      const result = await cardRepository.findByValue('non_existent_value')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeDefined()
      expect(result.value.length).toBe(0)
    })
  })

  describe('Card Type Validation', () => {
    it('should create all valid number cards', async () => {
      const numberCards = []
      const colors = ['red', 'blue', 'green', 'yellow']
      const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

      for (const color of colors) {
        for (const value of values) {
          numberCards.push({ color, type: 'number', value })
        }
      }

      const mockCards = numberCards.map((card, index) => ({
        id: index + 1,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      cardRepository.createMany.mockResolvedValue(Result.success(mockCards))

      const result = await cardRepository.createMany(numberCards)

      expect(result.isSuccess).toBe(true)
      expect(result.value.length).toBe(40) // 4 colors × 10 numbers
      expect(result.value.every(card => card.type === 'number')).toBe(true)
    })

    it('should create all valid action cards', async () => {
      const actionCards = []
      const colors = ['red', 'blue', 'green', 'yellow']
      const actionTypes = ['skip', 'reverse', 'draw_two']

      for (const color of colors) {
        for (const type of actionTypes) {
          actionCards.push({ color, type, value: null })
        }
      }

      const mockCards = actionCards.map((card, index) => ({
        id: index + 41,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      cardRepository.createMany.mockResolvedValue(Result.success(mockCards))

      const result = await cardRepository.createMany(actionCards)

      expect(result.isSuccess).toBe(true)
      expect(result.value.length).toBe(12) // 4 colors × 3 action types
      expect(result.value.every(card => actionTypes.includes(card.type))).toBe(true)
      expect(result.value.every(card => card.value === null)).toBe(true)
    })

    it('should create all valid wild cards', async () => {
      const wildCards = [
        { color: 'wild', type: 'wild', value: null },
        { color: 'wild', type: 'wild_draw_four', value: null }
      ]

      const mockCards = wildCards.map((card, index) => ({
        id: index + 53,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      cardRepository.createMany.mockResolvedValue(Result.success(mockCards))

      const result = await cardRepository.createMany(wildCards)

      expect(result.isSuccess).toBe(true)
      expect(result.value.length).toBe(2)
      expect(result.value.every(card => card.color === 'wild')).toBe(true)
      expect(result.value.every(card => card.value === null)).toBe(true)
    })
  })

  describe('Card Filtering and Queries', () => {
    let filterTestCards

    beforeEach(async () => {
      // Create a comprehensive set of test cards
      filterTestCards = [
        // Red cards
        { id: 1, color: 'red', type: 'number', value: '0' },
        { id: 2, color: 'red', type: 'number', value: '5' },
        { id: 3, color: 'red', type: 'skip', value: null },
        { id: 4, color: 'red', type: 'reverse', value: null },
        { id: 5, color: 'red', type: 'draw_two', value: null },
        // Blue cards
        { id: 6, color: 'blue', type: 'number', value: '3' },
        { id: 7, color: 'blue', type: 'number', value: '7' },
        { id: 8, color: 'blue', type: 'skip', value: null },
        // Green cards
        { id: 9, color: 'green', type: 'number', value: '1' },
        { id: 10, color: 'green', type: 'reverse', value: null },
        // Yellow cards
        { id: 11, color: 'yellow', type: 'number', value: '9' },
        { id: 12, color: 'yellow', type: 'draw_two', value: null },
        // Wild cards
        { id: 13, color: 'wild', type: 'wild', value: null },
        { id: 14, color: 'wild', type: 'wild_draw_four', value: null }
      ]

      cardRepository.createMany.mockResolvedValue(Result.success(filterTestCards))
    })

    it('should filter cards by multiple criteria', async () => {
      const redCards = filterTestCards.filter(card => card.color === 'red')
      cardRepository.findByColor.mockResolvedValue(Result.success(redCards))

      const redResult = await cardRepository.findByColor('red')
      expect(redResult.isSuccess).toBe(true)
      const numberCards = redResult.value.filter(card => card.type === 'number')

      expect(numberCards.length).toBeGreaterThanOrEqual(2)
      expect(numberCards.every(card => card.color === 'red' && card.type === 'number')).toBe(true)
    })

    it('should find action cards across all colors', async () => {
      const skipCards = filterTestCards.filter(card => card.type === 'skip')
      const reverseCards = filterTestCards.filter(card => card.type === 'reverse')
      const drawTwoCards = filterTestCards.filter(card => card.type === 'draw_two')

      cardRepository.findByType.mockImplementation((type) => {
        if (type === 'skip') return Promise.resolve(Result.success(skipCards))
        if (type === 'reverse') return Promise.resolve(Result.success(reverseCards))
        if (type === 'draw_two') return Promise.resolve(Result.success(drawTwoCards))
        return Promise.resolve(Result.success([]))
      })

      const skipResult = await cardRepository.findByType('skip')
      const reverseResult = await cardRepository.findByType('reverse')
      const drawTwoResult = await cardRepository.findByType('draw_two')

      expect(skipResult.isSuccess).toBe(true)
      expect(reverseResult.isSuccess).toBe(true)
      expect(drawTwoResult.isSuccess).toBe(true)
      expect(skipResult.value.length).toBeGreaterThanOrEqual(2)
      expect(reverseResult.value.length).toBeGreaterThanOrEqual(2)
      expect(drawTwoResult.value.length).toBeGreaterThanOrEqual(2)
    })

    it('should distinguish between wild card types', async () => {
      const regularWildCards = filterTestCards.filter(card => card.type === 'wild')
      const wildDrawFourCards = filterTestCards.filter(card => card.type === 'wild_draw_four')

      cardRepository.findByType.mockImplementation((type) => {
        if (type === 'wild') return Promise.resolve(Result.success(regularWildCards))
        if (type === 'wild_draw_four') return Promise.resolve(Result.success(wildDrawFourCards))
        return Promise.resolve(Result.success([]))
      })

      const regularWildResult = await cardRepository.findByType('wild')
      const wildDrawFourResult = await cardRepository.findByType('wild_draw_four')

      expect(regularWildResult.isSuccess).toBe(true)
      expect(wildDrawFourResult.isSuccess).toBe(true)
      expect(regularWildResult.value.length).toBeGreaterThanOrEqual(1)
      expect(wildDrawFourResult.value.length).toBeGreaterThanOrEqual(1)
      expect(regularWildResult.value.every(card => card.type === 'wild')).toBe(true)
      expect(wildDrawFourResult.value.every(card => card.type === 'wild_draw_four')).toBe(true)
    })

    it('should handle cards with null values correctly', async () => {
      const nullValueCards = filterTestCards.filter(card => card.value === null)
      cardRepository.findByValue.mockResolvedValue(Result.success(nullValueCards))

      const nullValueResult = await cardRepository.findByValue(null)

      expect(nullValueResult.isSuccess).toBe(true)
      expect(nullValueResult.value.length).toBeGreaterThanOrEqual(8) // All action and wild cards
      expect(nullValueResult.value.every(card =>
        card.type !== 'number' && card.value === null
      )).toBe(true)
    })
  })

  describe('Bulk Operations', () => {
    it('should create a full UNO deck', async () => {
      const unoDeck = []

      // Number cards (0-9 for each color, 0 appears once, 1-9 appear twice)
      const colors = ['red', 'blue', 'green', 'yellow']
      for (const color of colors) {
        unoDeck.push({ color, type: 'number', value: '0' }) // One 0 per color
        for (let i = 1; i <= 9; i++) {
          unoDeck.push({ color, type: 'number', value: i.toString() }) // First set
          unoDeck.push({ color, type: 'number', value: i.toString() }) // Second set
        }
      }

      // Action cards (2 of each per color)
      const actionTypes = ['skip', 'reverse', 'draw_two']
      for (const color of colors) {
        for (const type of actionTypes) {
          unoDeck.push({ color, type, value: null })
          unoDeck.push({ color, type, value: null })
        }
      }

      // Wild cards (4 of each type)
      for (let i = 0; i < 4; i++) {
        unoDeck.push({ color: 'wild', type: 'wild', value: null })
        unoDeck.push({ color: 'wild', type: 'wild_draw_four', value: null })
      }

      const mockUnoDeck = unoDeck.map((card, index) => ({
        id: index + 1,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      cardRepository.createMany.mockResolvedValue(Result.success(mockUnoDeck))

      const result = await cardRepository.createMany(unoDeck)

      expect(result.isSuccess).toBe(true)
      expect(result.value.length).toBe(108) // Standard UNO deck size

      // Verify card distribution
      const numberCards = result.value.filter(card => card.type === 'number')
      const actionCards = result.value.filter(card => ['skip', 'reverse', 'draw_two'].includes(card.type))
      const wildCards = result.value.filter(card => card.color === 'wild')

      expect(numberCards.length).toBe(76) // 4 colors × (1 zero + 18 other numbers)
      expect(actionCards.length).toBe(24) // 4 colors × 3 action types × 2 cards
      expect(wildCards.length).toBe(8) // 4 wild + 4 wild draw four
    })

    it('should handle empty array for createMany', async () => {
      cardRepository.createMany.mockResolvedValue(Result.failure(new Error('Cannot create empty array')))

      const result = await cardRepository.createMany([])

      expect(result.isSuccess).toBe(false) // Should fail for empty array
    })
  })
})
