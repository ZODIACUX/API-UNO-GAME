const { UnoController } = require('../../../controllers/UnoController')

describe('UnoController - New UNO Game Features', () => {
  let unoController
  let mockReq
  let mockRes

  beforeEach(() => {
    unoController = new UnoController()
    mockReq = {
      body: {}
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('nextTurn - Clockwise Direction', () => {
    it('should advance to next player in clockwise direction', async () => {
      mockReq.body = {
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        currentPlayerIndex: 1
      }

      await unoController.nextTurn(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 2,
          nextPlayer: 'Charlie'
        }
      })
    })

    it('should wrap around to first player when at end', async () => {
      mockReq.body = {
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        currentPlayerIndex: 3
      }

      await unoController.nextTurn(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 0,
          nextPlayer: 'Alice'
        }
      })
    })

    it('should handle invalid player index', async () => {
      mockReq.body = {
        players: ['Alice', 'Bob'],
        currentPlayerIndex: 5
      }

      await unoController.nextTurn(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid current player index'
      })
    })

    it('should handle negative player index', async () => {
      mockReq.body = {
        players: ['Alice', 'Bob'],
        currentPlayerIndex: -1
      }

      await unoController.nextTurn(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid current player index'
      })
    })
  })

  describe('playCard - Skip Cards', () => {
    it('should skip next player in clockwise direction', async () => {
      mockReq.body = {
        cardPlayed: 'skip',
        currentPlayerIndex: 2,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 0,
          nextPlayer: 'Alice',
          skippedPlayer: 'Diana'
        }
      })
    })

    it('should skip next player in counterclockwise direction', async () => {
      mockReq.body = {
        cardPlayed: 'skip',
        currentPlayerIndex: 2,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'counterclockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 0,
          nextPlayer: 'Alice',
          skippedPlayer: 'Bob'
        }
      })
    })

    it('should handle skip card with wrap around', async () => {
      mockReq.body = {
        cardPlayed: 'skip',
        currentPlayerIndex: 3,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 1,
          nextPlayer: 'Bob',
          skippedPlayer: 'Alice'
        }
      })
    })
  })

  describe('playCard - Reverse Cards', () => {
    it('should reverse direction from clockwise to counterclockwise', async () => {
      mockReq.body = {
        cardPlayed: 'reverse',
        currentPlayerIndex: 2,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newDirection: 'counterclockwise',
          nextPlayerIndex: 1,
          nextPlayer: 'Bob'
        }
      })
    })

    it('should reverse direction from counterclockwise to clockwise', async () => {
      mockReq.body = {
        cardPlayed: 'reverse',
        currentPlayerIndex: 2,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'counterclockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newDirection: 'clockwise',
          nextPlayerIndex: 3,
          nextPlayer: 'Diana'
        }
      })
    })

    it('should handle reverse card with wrap around in counterclockwise', async () => {
      mockReq.body = {
        cardPlayed: 'reverse',
        currentPlayerIndex: 0,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newDirection: 'counterclockwise',
          nextPlayerIndex: 3,
          nextPlayer: 'Diana'
        }
      })
    })
  })

  describe('playCard - Normal Cards', () => {
    it('should advance normally for non-special cards in clockwise direction', async () => {
      mockReq.body = {
        cardPlayed: 'red_5',
        currentPlayerIndex: 1,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 2,
          nextPlayer: 'Charlie'
        }
      })
    })

    it('should advance normally for non-special cards in counterclockwise direction', async () => {
      mockReq.body = {
        cardPlayed: 'blue_7',
        currentPlayerIndex: 1,
        players: ['Alice', 'Bob', 'Charlie', 'Diana'],
        direction: 'counterclockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          nextPlayerIndex: 0,
          nextPlayer: 'Alice'
        }
      })
    })

    it('should handle invalid player index for playCard', async () => {
      mockReq.body = {
        cardPlayed: 'skip',
        currentPlayerIndex: 10,
        players: ['Alice', 'Bob'],
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid current player index'
      })
    })
  })

  describe('drawCard - Draw Cards When Cannot Play', () => {
    it('should draw a card and add to player hand', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'blue_5'],
        deck: ['green_4', 'yellow_skip', 'red_9'],
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newHand: ['red_2', 'blue_5', 'green_4'],
          drawnCard: 'green_4',
          playable: false
        }
      })
    })

    it('should draw a playable card (same color)', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'green_5'],
        deck: ['blue_4', 'yellow_skip', 'red_9'],
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newHand: ['red_2', 'green_5', 'blue_4'],
          drawnCard: 'blue_4',
          playable: true
        }
      })
    })

    it('should draw a playable card (same value)', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'green_5'],
        deck: ['yellow_7', 'blue_skip', 'red_9'],
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newHand: ['red_2', 'green_5', 'yellow_7'],
          drawnCard: 'yellow_7',
          playable: true
        }
      })
    })

    it('should draw a wild card (always playable)', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'green_5'],
        deck: ['wild_draw_four', 'blue_skip', 'red_9'],
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newHand: ['red_2', 'green_5', 'wild_draw_four'],
          drawnCard: 'wild_draw_four',
          playable: true
        }
      })
    })

    it('should handle empty deck', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'blue_5'],
        deck: [],
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No cards available in deck'
      })
    })

    it('should handle first card scenario (no current card)', async () => {
      mockReq.body = {
        playerHand: ['red_2', 'blue_5'],
        deck: ['green_4'],
        currentCard: null
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        body: {
          newHand: ['red_2', 'blue_5', 'green_4'],
          drawnCard: 'green_4',
          playable: true
        }
      })
    })
  })

  describe('isCardPlayable - Helper Method', () => {
    it('should return true for same color cards', () => {
      const result = unoController.isCardPlayable('red_5', 'red_7')
      expect(result).toBe(true)
    })

    it('should return true for same value cards', () => {
      const result = unoController.isCardPlayable('blue_5', 'red_5')
      expect(result).toBe(true)
    })

    it('should return true for wild cards', () => {
      const result = unoController.isCardPlayable('wild_draw_four', 'red_5')
      expect(result).toBe(true)
    })

    it('should return false for different color and value', () => {
      const result = unoController.isCardPlayable('blue_3', 'red_5')
      expect(result).toBe(false)
    })

    it('should return true when no current card (first play)', () => {
      const result = unoController.isCardPlayable('blue_3', null)
      expect(result).toBe(true)
    })

    it('should handle skip cards correctly', () => {
      const result = unoController.isCardPlayable('red_skip', 'red_5')
      expect(result).toBe(true)
    })

    it('should handle reverse cards correctly', () => {
      const result = unoController.isCardPlayable('blue_reverse', 'blue_7')
      expect(result).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle nextTurn errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Force an error by making players undefined
      mockReq.body = {
        players: undefined,
        currentPlayerIndex: 1
      }

      await unoController.nextTurn(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      })

      consoleSpy.mockRestore()
    })

    it('should handle playCard errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Force an error by making players undefined
      mockReq.body = {
        cardPlayed: 'skip',
        currentPlayerIndex: 1,
        players: undefined,
        direction: 'clockwise'
      }

      await unoController.playCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      })

      consoleSpy.mockRestore()
    })

    it('should handle drawCard errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Force an error by making deck undefined (this triggers the empty deck validation)
      mockReq.body = {
        playerHand: ['red_2'],
        deck: undefined,
        currentCard: 'blue_7'
      }

      await unoController.drawCard(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No cards available in deck'
      })

      consoleSpy.mockRestore()
    })
  })
})
