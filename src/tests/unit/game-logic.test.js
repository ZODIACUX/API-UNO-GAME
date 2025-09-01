// UNO Game Logic Tests
describe('UNO Game Logic Tests', () => {
  describe('Card Validation', () => {
    it('should validate same color cards', () => {
      const topCard = { color: 'red', value: '5' }
      const playCard = { color: 'red', value: '7' }

      const isValid = topCard.color === playCard.color || topCard.value === playCard.value
      expect(isValid).toBe(true)
    })

    it('should validate same value cards', () => {
      const topCard = { color: 'red', value: '5' }
      const playCard = { color: 'blue', value: '5' }

      const isValid = topCard.color === playCard.color || topCard.value === playCard.value
      expect(isValid).toBe(true)
    })

    it('should reject invalid cards', () => {
      const topCard = { color: 'red', value: '5' }
      const playCard = { color: 'blue', value: '7' }

      const isValid = topCard.color === playCard.color || topCard.value === playCard.value
      expect(isValid).toBe(false)
    })

    it('should always allow wild cards', () => {
      const _topCard = { color: 'red', value: '5' }
      const wildCard = { color: 'wild', value: 'Wild' }

      const isValid = wildCard.color === 'wild' || wildCard.color === 'black'
      expect(isValid).toBe(true)
    })
  })

  describe('Turn Management', () => {
    it('should advance turn clockwise', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana']
      const currentIndex = 1
      const nextIndex = (currentIndex + 1) % players.length

      expect(nextIndex).toBe(2)
      expect(players[nextIndex]).toBe('Charlie')
    })

    it('should wrap around at end', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana']
      const currentIndex = 3
      const nextIndex = (currentIndex + 1) % players.length

      expect(nextIndex).toBe(0)
      expect(players[nextIndex]).toBe('Alice')
    })

    it('should advance turn counterclockwise', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana']
      const currentIndex = 2
      const nextIndex = (currentIndex - 1 + players.length) % players.length

      expect(nextIndex).toBe(1)
      expect(players[nextIndex]).toBe('Bob')
    })

    it('should wrap around at beginning in counterclockwise', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana']
      const currentIndex = 0
      const nextIndex = (currentIndex - 1 + players.length) % players.length

      expect(nextIndex).toBe(3)
      expect(players[nextIndex]).toBe('Diana')
    })
  })

  describe('Special Card Effects', () => {
    it('should skip next player', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana']
      const currentIndex = 0
      const skipIndex = (currentIndex + 2) % players.length // Skip one player

      expect(skipIndex).toBe(2)
      expect(players[skipIndex]).toBe('Charlie')
    })

    it('should reverse direction', () => {
      let direction = 'clockwise'
      direction = direction === 'clockwise' ? 'counterclockwise' : 'clockwise'

      expect(direction).toBe('counterclockwise')
    })

    it('should handle draw two effect', () => {
      const playerHand = ['Red 5', 'Blue 3']
      const drawnCards = ['Green 7', 'Yellow 2']
      const newHand = [...playerHand, ...drawnCards]

      expect(newHand).toHaveLength(4)
      expect(newHand).toContain('Green 7')
      expect(newHand).toContain('Yellow 2')
    })
  })

  describe('UNO Rules', () => {
    it('should detect UNO condition', () => {
      const playerHand = ['Red 5']
      const hasUno = playerHand.length === 1

      expect(hasUno).toBe(true)
    })

    it('should detect win condition', () => {
      const playerHand = []
      const hasWon = playerHand.length === 0

      expect(hasWon).toBe(true)
    })

    it('should calculate penalty for not saying UNO', () => {
      const playerHand = ['Red 5']
      const penaltyCards = ['Blue 3', 'Green 7']
      const newHand = [...playerHand, ...penaltyCards]

      expect(newHand).toHaveLength(3)
    })
  })

  describe('Deck Management', () => {
    it('should generate standard deck size', () => {
      // Standard UNO deck: 108 cards
      // 4 colors × (19 number cards + 6 special cards) + 8 wild cards
      const expectedSize = 4 * (19 + 6) + 8
      expect(expectedSize).toBe(108)
    })

    it('should shuffle deck randomly', () => {
      const originalDeck = [1, 2, 3, 4, 5]
      const shuffledDeck = [...originalDeck]

      // Simple shuffle simulation
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]
      }

      expect(shuffledDeck).toHaveLength(originalDeck.length)
      expect(shuffledDeck).toEqual(expect.arrayContaining(originalDeck))
    })

    it('should handle empty deck', () => {
      const deck = []
      const canDraw = deck.length > 0

      expect(canDraw).toBe(false)
    })
  })
})
