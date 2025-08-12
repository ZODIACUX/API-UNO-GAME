const unoGameRepository = require('../repositories/unoGameRepository')
const gamePlayerService = require('./gamePlayerService')
const { ApiError } = require('../utils-api/responseHelper')
const { generateInitialDeck } = require('../utils-api/cardGenerator')

class UnoGameService {
  constructor() {
    this.unoGameRepository = unoGameRepository
  }

  async createGame(name, creatorId, maxPlayers = 4) {
    const game = await this.unoGameRepository.create({
      name,
      creatorId,
      maxPlayers,
      status: 'waiting',
      currentDirection: 'clockwise',
      currentPlayer: null,
      currentColor: null,
      currentValue: null
    })

    // El creador se une automáticamente al juego
    await gamePlayerService.joinGame(creatorId, game.id)

    return game
  }

  async getGame(id) {
    const game = await this.unoGameRepository.findById(id)
    if (!game) {
      throw new ApiError('Game not found', 404)
    }
    return game
  }

  async getAllGames() {
    return await this.unoGameRepository.findAll()
  }

  async getActiveGames() {
    return await this.unoGameRepository.findActiveGames()
  }

  async startGame(gameId) {
    const game = await this.getGame(gameId)

    if (game.status !== 'waiting') {
      throw new ApiError('Game has already started', 400)
    }

    // Verificar que haya suficientes jugadores
    if (game.players.length < 2) {
      throw new ApiError('Not enough players to start the game', 400)
    }

    // Verificar que todos los jugadores estén listos
    const notReadyPlayers = game.players.filter(player => !player.isReady)
    if (notReadyPlayers.length > 0) {
      throw new ApiError('All players must be ready to start the game', 400)
    }

    // Generar y repartir las cartas iniciales
    const deck = await generateInitialDeck()
    await this.dealInitialCards(game, deck)

    // Actualizar el estado del juego
    const firstPlayer = game.players[0]
    await this.unoGameRepository.update(gameId, {
      status: 'in_progress',
      currentPlayer: firstPlayer.id,
      currentDirection: 'clockwise'
    })

    return await this.getGame(gameId)
  }

  async playCard(gameId, playerId, cardId) {
    const game = await this.getGame(gameId)

    if (game.status !== 'in_progress') {
      throw new ApiError('Game is not in progress', 400)
    }

    if (game.currentPlayer !== playerId) {
      throw new ApiError('Not your turn', 400)
    }

    const player = game.players.find(p => p.id === playerId)
    if (!player) {
      throw new ApiError('Player not found in game', 404)
    }

    // Verificar si el jugador tiene la carta
    const card = player.cards.find(c => c.id === cardId)
    if (!card) {
      throw new ApiError('Card not found in player hand', 404)
    }

    // Verificar si la carta se puede jugar
    if (!this.isValidPlay(game, card)) {
      throw new ApiError('Invalid card play', 400)
    }

    // Aplicar efectos de la carta
    await this.applyCardEffects(game, card)

    // Actualizar el estado del juego
    const nextPlayer = this.getNextPlayer(game)
    await this.unoGameRepository.update(game.id, {
      currentPlayer: nextPlayer.id,
      currentColor: card.card.color === 'black' ? game.currentColor : card.card.color,
      currentValue: card.card.value
    })

    // Verificar condiciones de victoria
    if (player.cards.length === 0) {
      await this.endGame(game.id, playerId)
    }

    return await this.getGame(game.id)
  }

  async drawCard(gameId, playerId) {
    const game = await this.getGame(gameId)

    if (game.status !== 'in_progress') {
      throw new ApiError('Game is not in progress', 400)
    }

    if (game.currentPlayer !== playerId) {
      throw new ApiError('Not your turn', 400)
    }

    const player = game.players.find(p => p.id === playerId)
    if (!player) {
      throw new ApiError('Player not found in game', 404)
    }

    // Obtener una carta del mazo
    const card = await this.drawCardFromDeck(game)

    // Agregar la carta a la mano del jugador
    await gamePlayerService.addCardToPlayer(playerId, card.id)

    // Pasar al siguiente jugador
    const nextPlayer = this.getNextPlayer(game)
    await this.unoGameRepository.update(game.id, {
      currentPlayer: nextPlayer.id
    })

    return await this.getGame(game.id)
  }

  async endGame(gameId, winnerId) {
    const game = await this.getGame(gameId)

    if (game.status !== 'in_progress') {
      throw new ApiError('Game is not in progress', 400)
    }

    await this.unoGameRepository.update(gameId, {
      status: 'completed',
      winnerId
    })

    return await this.getGame(gameId)
  }

  async dealInitialCards(game, deck) {
    // Repartir 7 cartas a cada jugador
    for (const player of game.players) {
      for (let i = 0; i < 7; i++) {
        const card = deck.pop()
        await gamePlayerService.addCardToPlayer(player.id, card.id)
      }
    }

    // Colocar la primera carta en el mazo de descarte
    const firstCard = deck.pop()
    await this.unoGameRepository.update(game.id, {
      currentColor: firstCard.color,
      currentValue: firstCard.value
    })
  }

  isValidPlay(game, card) {
    // Si es la primera jugada, cualquier carta es válida
    if (!game.currentColor && !game.currentValue) return true

    // Las cartas negras (wild) siempre son válidas
    if (card.card.color === 'black') return true

    // La carta debe coincidir en color o valor
    return card.card.color === game.currentColor || card.card.value === game.currentValue
  }

  async applyCardEffects(game, card) {
    switch (card.card.value) {
    case 'skip': {
      // Skip next player's turn
      break
    }
    case 'reverse': {
      game.currentDirection = game.currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'
      break
    }
    case 'draw_two': {
      const nextPlayer = this.getNextPlayer(game)
      await this.drawCardsForPlayer(game, nextPlayer.id, 2)
      break
    }
    case 'wild_draw_four': {
      const nextPlayerForWild = this.getNextPlayer(game)
      await this.drawCardsForPlayer(game, nextPlayerForWild.id, 4)
      break
    }
    }
  }

  getNextPlayer(game) {
    const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentPlayer)
    if (game.currentDirection === 'clockwise') {
      return game.players[(currentPlayerIndex + 1) % game.players.length]
    } else {
      return game.players[(currentPlayerIndex - 1 + game.players.length) % game.players.length]
    }
  }

  async drawCardFromDeck(game) {
    // Obtener una carta del mazo
    const deck = game.cards.filter(c => c.location === 'deck')
    if (deck.length === 0) {
      // Si no hay cartas en el mazo, barajar el descarte
      const discard = game.cards.filter(c => c.location === 'discard')
      await this.shuffleDiscardToDeck(game, discard)
    }
    const card = deck[Math.floor(Math.random() * deck.length)]
    return card
  }

  async drawCardsForPlayer(game, playerId, count) {
    for (let i = 0; i < count; i++) {
      const card = await this.drawCardFromDeck(game)
      await gamePlayerService.addCardToPlayer(playerId, card.id)
    }
  }

  async shuffleDiscardToDeck(game, discard) {
    // Mover todas las cartas del descarte al mazo excepto la última
    const cardsToShuffle = discard.slice(0, -1)

    for (const card of cardsToShuffle) {
      await this.unoGameRepository.update(game.id, {
        cards: game.cards.map(c => {
          if (c.id === card.id) {
            return { ...c, location: 'deck' }
          }
          return c
        })
      })
    }
  }
}

module.exports = new UnoGameService()
