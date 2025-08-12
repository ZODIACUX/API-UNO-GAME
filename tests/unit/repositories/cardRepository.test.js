const cardRepository = require('../../../src/repositories/cardRepository')

describe('CardRepository CRUD Operations', () => {
  describe('Create Card', () => {
    it('should create a single card successfully', async () => {
      const cardData = {
        color: 'red',
        type: 'number',
        value: '5'
      }

      const createdCard = await cardRepository.create(cardData)

      expect(createdCard).toBeDefined()
      expect(createdCard.id).toBeDefined()
      expect(createdCard.color).toBe(cardData.color)
      expect(createdCard.type).toBe(cardData.type)
      expect(createdCard.value).toBe(cardData.value)
    })

    it('should create a wild card successfully', async () => {
      const cardData = {
        color: 'wild',
        type: 'wild',
        value: null
      }

      const createdCard = await cardRepository.create(cardData)

      expect(createdCard).toBeDefined()
      expect(createdCard.color).toBe('wild')
      expect(createdCard.type).toBe('wild')
      expect(createdCard.value).toBeNull()
    })

    it('should create an action card successfully', async () => {
      const cardData = {
        color: 'blue',
        type: 'skip',
        value: null
      }

      const createdCard = await cardRepository.create(cardData)

      expect(createdCard).toBeDefined()
      expect(createdCard.color).toBe('blue')
      expect(createdCard.type).toBe('skip')
      expect(createdCard.value).toBeNull()
    })

    it('should create multiple cards successfully', async () => {
      const cardsData = [
        { color: 'red', type: 'number', value: '1' },
        { color: 'blue', type: 'number', value: '2' },
        { color: 'green', type: 'skip', value: null },
        { color: 'yellow', type: 'reverse', value: null }
      ]

      const createdCards = await cardRepository.createMany(cardsData)

      expect(createdCards).toBeDefined()
      expect(createdCards.length).toBe(4)
      expect(createdCards[0].color).toBe('red')
      expect(createdCards[1].color).toBe('blue')
      expect(createdCards[2].type).toBe('skip')
      expect(createdCards[3].type).toBe('reverse')
    })

    it('should fail to create card with invalid color', async () => {
      const cardData = {
        color: 'invalid_color',
        type: 'number',
        value: '5'
      }

      await expect(cardRepository.create(cardData)).rejects.toThrow()
    })

    it('should fail to create card with invalid type', async () => {
      const cardData = {
        color: 'red',
        type: 'invalid_type',
        value: '5'
      }

      await expect(cardRepository.create(cardData)).rejects.toThrow()
    })
  })

  describe('Read Card', () => {
    let testCards

    beforeEach(async () => {
      // Create test cards for reading operations
      testCards = await cardRepository.createMany([
        { color: 'red', type: 'number', value: '0' },
        { color: 'red', type: 'number', value: '1' },
        { color: 'blue', type: 'number', value: '2' },
        { color: 'green', type: 'skip', value: null },
        { color: 'yellow', type: 'reverse', value: null },
        { color: 'red', type: 'draw_two', value: null },
        { color: 'wild', type: 'wild', value: null },
        { color: 'wild', type: 'wild_draw_four', value: null }
      ])
    })

    it('should find card by ID', async () => {
      const foundCard = await cardRepository.findById(testCards[0].id)

      expect(foundCard).toBeDefined()
      expect(foundCard.id).toBe(testCards[0].id)
      expect(foundCard.color).toBe('red')
      expect(foundCard.type).toBe('number')
      expect(foundCard.value).toBe('0')
    })

    it('should return null for non-existent card ID', async () => {
      const foundCard = await cardRepository.findById(99999)

      expect(foundCard).toBeNull()
    })

    it('should find cards by type', async () => {
      const numberCards = await cardRepository.findByType('number')
      const wildCards = await cardRepository.findByType('wild')

      expect(numberCards.length).toBeGreaterThanOrEqual(3)
      expect(wildCards.length).toBeGreaterThanOrEqual(1)
      expect(numberCards.every(card => card.type === 'number')).toBe(true)
      expect(wildCards.every(card => card.type === 'wild')).toBe(true)
    })

    it('should find cards by color', async () => {
      const redCards = await cardRepository.findByColor('red')
      const wildCards = await cardRepository.findByColor('wild')

      expect(redCards.length).toBeGreaterThanOrEqual(3)
      expect(wildCards.length).toBeGreaterThanOrEqual(2)
      expect(redCards.every(card => card.color === 'red')).toBe(true)
      expect(wildCards.every(card => card.color === 'wild')).toBe(true)
    })

    it('should find cards by value', async () => {
      const value1Cards = await cardRepository.findByValue('1')
      const nullValueCards = await cardRepository.findByValue(null)

      expect(value1Cards.length).toBeGreaterThanOrEqual(1)
      expect(nullValueCards.length).toBeGreaterThanOrEqual(4) // skip, reverse, draw_two, wild cards
      expect(value1Cards.every(card => card.value === '1')).toBe(true)
      expect(nullValueCards.every(card => card.value === null)).toBe(true)
    })

    it('should find all cards', async () => {
      const allCards = await cardRepository.findAll()

      expect(allCards).toBeDefined()
      expect(allCards.length).toBeGreaterThanOrEqual(8)
    })

    it('should return empty array for non-existent type', async () => {
      const cards = await cardRepository.findByType('non_existent_type')

      expect(cards).toBeDefined()
      expect(cards.length).toBe(0)
    })

    it('should return empty array for non-existent color', async () => {
      const cards = await cardRepository.findByColor('non_existent_color')

      expect(cards).toBeDefined()
      expect(cards.length).toBe(0)
    })

    it('should return empty array for non-existent value', async () => {
      const cards = await cardRepository.findByValue('non_existent_value')

      expect(cards).toBeDefined()
      expect(cards.length).toBe(0)
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

      const createdCards = await cardRepository.createMany(numberCards)

      expect(createdCards.length).toBe(40) // 4 colors × 10 numbers
      expect(createdCards.every(card => card.type === 'number')).toBe(true)
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

      const createdCards = await cardRepository.createMany(actionCards)

      expect(createdCards.length).toBe(12) // 4 colors × 3 action types
      expect(createdCards.every(card => actionTypes.includes(card.type))).toBe(true)
      expect(createdCards.every(card => card.value === null)).toBe(true)
    })

    it('should create all valid wild cards', async () => {
      const wildCards = [
        { color: 'wild', type: 'wild', value: null },
        { color: 'wild', type: 'wild_draw_four', value: null }
      ]

      const createdCards = await cardRepository.createMany(wildCards)

      expect(createdCards.length).toBe(2)
      expect(createdCards.every(card => card.color === 'wild')).toBe(true)
      expect(createdCards.every(card => card.value === null)).toBe(true)
    })
  })

  describe('Card Filtering and Queries', () => {
    beforeEach(async () => {
      // Create a comprehensive set of test cards
      const testCards = [
        // Red cards
        { color: 'red', type: 'number', value: '0' },
        { color: 'red', type: 'number', value: '5' },
        { color: 'red', type: 'skip', value: null },
        { color: 'red', type: 'reverse', value: null },
        { color: 'red', type: 'draw_two', value: null },
        // Blue cards
        { color: 'blue', type: 'number', value: '3' },
        { color: 'blue', type: 'number', value: '7' },
        { color: 'blue', type: 'skip', value: null },
        // Green cards
        { color: 'green', type: 'number', value: '1' },
        { color: 'green', type: 'reverse', value: null },
        // Yellow cards
        { color: 'yellow', type: 'number', value: '9' },
        { color: 'yellow', type: 'draw_two', value: null },
        // Wild cards
        { color: 'wild', type: 'wild', value: null },
        { color: 'wild', type: 'wild_draw_four', value: null }
      ]

      await cardRepository.createMany(testCards)
    })

    it('should filter cards by multiple criteria', async () => {
      const redNumberCards = await cardRepository.findByColor('red')
      const numberCards = redNumberCards.filter(card => card.type === 'number')

      expect(numberCards.length).toBeGreaterThanOrEqual(2)
      expect(numberCards.every(card => card.color === 'red' && card.type === 'number')).toBe(true)
    })

    it('should find action cards across all colors', async () => {
      const skipCards = await cardRepository.findByType('skip')
      const reverseCards = await cardRepository.findByType('reverse')
      const drawTwoCards = await cardRepository.findByType('draw_two')

      expect(skipCards.length).toBeGreaterThanOrEqual(2)
      expect(reverseCards.length).toBeGreaterThanOrEqual(2)
      expect(drawTwoCards.length).toBeGreaterThanOrEqual(2)
    })

    it('should distinguish between wild card types', async () => {
      const regularWildCards = await cardRepository.findByType('wild')
      const wildDrawFourCards = await cardRepository.findByType('wild_draw_four')

      expect(regularWildCards.length).toBeGreaterThanOrEqual(1)
      expect(wildDrawFourCards.length).toBeGreaterThanOrEqual(1)
      expect(regularWildCards.every(card => card.type === 'wild')).toBe(true)
      expect(wildDrawFourCards.every(card => card.type === 'wild_draw_four')).toBe(true)
    })

    it('should handle cards with null values correctly', async () => {
      const nullValueCards = await cardRepository.findByValue(null)

      expect(nullValueCards.length).toBeGreaterThanOrEqual(8) // All action and wild cards
      expect(nullValueCards.every(card =>
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

      const createdDeck = await cardRepository.createMany(unoDeck)

      expect(createdDeck.length).toBe(108) // Standard UNO deck size

      // Verify card distribution
      const numberCards = createdDeck.filter(card => card.type === 'number')
      const actionCards = createdDeck.filter(card => ['skip', 'reverse', 'draw_two'].includes(card.type))
      const wildCards = createdDeck.filter(card => card.color === 'wild')

      expect(numberCards.length).toBe(76) // 4 colors × (1 zero + 18 other numbers)
      expect(actionCards.length).toBe(24) // 4 colors × 3 action types × 2 cards
      expect(wildCards.length).toBe(8) // 4 wild + 4 wild draw four
    })

    it('should handle empty array for createMany', async () => {
      const result = await cardRepository.createMany([])

      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })
  })
})
