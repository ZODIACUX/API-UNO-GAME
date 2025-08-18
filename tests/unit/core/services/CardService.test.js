const CardService = require('../../../../src/core/services/CardService')
const Result = require('../../../../src/core/errors/Result')

describe('CardService', () => {
  let cardService
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
      findByColor: jest.fn(),
      createMany: jest.fn()
    }
    cardService = new CardService(mockRepository)
  })

  describe('getCardsByType', () => {
    it('should successfully get cards by valid type', async () => {
      const cards = [{ id: 1, type: 'number', color: 'red', value: '5' }]
      mockRepository.findByType.mockResolvedValue(Result.success(cards))

      const result = await cardService.getCardsByType('number')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cards)
      expect(mockRepository.findByType).toHaveBeenCalledWith('number')
    })

    it('should fail with invalid card type', async () => {
      const result = await cardService.getCardsByType('invalid')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid card type')
      expect(mockRepository.findByType).not.toHaveBeenCalled()
    })

    it('should handle repository failure', async () => {
      mockRepository.findByType.mockResolvedValue(Result.failure(new Error('DB error')))

      const result = await cardService.getCardsByType('number')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Failed to retrieve cards by type')
    })
  })

  describe('getCardsByColor', () => {
    it('should successfully get cards by valid color', async () => {
      const cards = [{ id: 1, type: 'number', color: 'red', value: '5' }]
      mockRepository.findByColor.mockResolvedValue(Result.success(cards))

      const result = await cardService.getCardsByColor('red')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cards)
      expect(mockRepository.findByColor).toHaveBeenCalledWith('red')
    })

    it('should fail with invalid card color', async () => {
      const result = await cardService.getCardsByColor('purple')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid card color')
      expect(mockRepository.findByColor).not.toHaveBeenCalled()
    })
  })

  describe('createManyCards', () => {
    it('should successfully create multiple valid cards', async () => {
      const cardsData = [
        { type: 'number', color: 'red', value: '5' },
        { type: 'action', color: 'blue', value: 'skip' }
      ]
      const createdCards = [{ id: 1, ...cardsData[0] }, { id: 2, ...cardsData[1] }]

      mockRepository.createMany.mockResolvedValue(Result.success(createdCards))

      const result = await cardService.createManyCards(cardsData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(createdCards)
      expect(mockRepository.createMany).toHaveBeenCalledWith(cardsData)
    })

    it('should fail with empty array', async () => {
      const result = await cardService.createManyCards([])

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Cards data must be a non-empty array')
      expect(mockRepository.createMany).not.toHaveBeenCalled()
    })

    it('should fail with non-array input', async () => {
      const result = await cardService.createManyCards('not an array')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Cards data must be a non-empty array')
      expect(mockRepository.createMany).not.toHaveBeenCalled()
    })

    it('should fail with invalid card data', async () => {
      const cardsData = [
        { type: 'number', color: 'red', value: '5' },
        { type: 'invalid', color: 'blue', value: 'skip' }
      ]

      const result = await cardService.createManyCards(cardsData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid card type')
      expect(mockRepository.createMany).not.toHaveBeenCalled()
    })
  })

  describe('validateData', () => {
    it('should validate correct card data', () => {
      const cardData = { type: 'number', color: 'red', value: '5' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cardData)
    })

    it('should fail validation for missing data', () => {
      const result = cardService.validateData(null)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Card data is required and must be an object')
    })

    it('should fail validation for invalid type', () => {
      const cardData = { type: 'invalid', color: 'red', value: '5' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid card type')
    })

    it('should fail validation for invalid color', () => {
      const cardData = { type: 'number', color: 'purple', value: '5' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid card color')
    })

    it('should fail validation for invalid value', () => {
      const cardData = { type: 'number', color: 'red', value: 'invalid' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toContain('Invalid card value')
    })

    it('should validate action cards', () => {
      const cardData = { type: 'action', color: 'blue', value: 'skip' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cardData)
    })

    it('should validate wild cards', () => {
      const cardData = { type: 'wild', color: 'black', value: 'wild' }

      const result = cardService.validateData(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cardData)
    })
  })

  describe('validateUpdateData', () => {
    it('should use the same validation as validateData', () => {
      const cardData = { type: 'number', color: 'red', value: '5' }

      const result = cardService.validateUpdateData(cardData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(cardData)
    })
  })
})
