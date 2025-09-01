/**
 * LEGACY UNO GAME SERVICE - DEPRECATED
 *
 * This service has been refactored to follow SOLID principles.
 * Please use the new SOLID-compliant services instead:
 *
 * - GameManagementService: For game lifecycle management
 * - CardService: For card-related operations
 *
 * To get instances of these services, use the dependency injection container:
 *
 * const ServiceRegistration = require('../core/di/ServiceRegistration')
 * ServiceRegistration.registerServices()
 * const gameManagementService = ServiceRegistration.getService('gameManagementService')
 * const cardService = ServiceRegistration.getService('cardService')
 */

const ServiceRegistration = require('../core/di/ServiceRegistration')

// Initialize SOLID services
ServiceRegistration.registerServices()

// Get SOLID-compliant services
const gameManagementService = ServiceRegistration.getService('gameManagementService')
const cardService = ServiceRegistration.getService('cardService')

class UnoGameService {
  constructor() {
    console.warn('UnoGameService is deprecated. Use GameManagementService and CardService instead.')
  }

  async createGame(name, creatorId, maxPlayers = 4) {
    console.warn('UnoGameService.createGame() is deprecated. Use GameManagementService.createGame() instead.')
    return await gameManagementService.createGame(name, creatorId, { maxPlayers })
  }

  async getGame(id) {
    console.warn('UnoGameService.getGame() is deprecated. Use GameManagementService.getById() instead.')
    return await gameManagementService.getById(id)
  }

  async getAllGames() {
    console.warn('UnoGameService.getAllGames() is deprecated. Use GameManagementService.getAll() instead.')
    return await gameManagementService.getAll()
  }

  async getActiveGames() {
    console.warn('UnoGameService.getActiveGames() is deprecated. Use GameManagementService.getActiveGames() instead.')
    return await gameManagementService.getActiveGames()
  }

  async startGame(_gameId) {
    console.warn('UnoGameService.startGame() is deprecated. Use GameManagementService.startGame() instead.')
    // This method requires additional parameters in the new architecture
    throw new Error('Use GameManagementService.startGame(gameId, creatorId) instead')
  }

  async playCard(gameId, playerId, cardId) {
    console.warn('UnoGameService.playCard() is deprecated. Use CardService.playCard() instead.')
    return await cardService.playCard(gameId, playerId, cardId)
  }

  async drawCard(gameId, playerId) {
    console.warn('UnoGameService.drawCard() is deprecated. Use CardService.drawCard() instead.')
    return await cardService.drawCard(gameId, playerId)
  }

  async endGame(_gameId, _winnerId) {
    console.warn('UnoGameService.endGame() is deprecated. Use GameManagementService.endGame() instead.')
    // This method requires additional parameters in the new architecture
    throw new Error('Use GameManagementService.endGame(gameId, creatorId) instead')
  }

  async dealInitialCards(game, deck) {
    console.warn('UnoGameService.dealInitialCards() is deprecated. Use CardService.dealInitialCards() instead.')
    return await cardService.dealInitialCards(game.id, deck)
  }

  isValidPlay(game, card) {
    console.warn('UnoGameService.isValidPlay() is deprecated. Use CardService.validateCardPlay() instead.')
    return cardService.validateCardPlay(game.id, card.id)
  }

  async applyCardEffects(game, card) {
    console.warn('UnoGameService.applyCardEffects() is deprecated. Use CardService.applyCardEffects() instead.')
    return await cardService.applyCardEffects(game.id, card.id)
  }

  getNextPlayer(game) {
    console.warn('UnoGameService.getNextPlayer() is deprecated. Use GameManagementService.getNextPlayer() instead.')
    return gameManagementService.getNextPlayer(game)
  }

  async drawCardFromDeck(game) {
    console.warn('UnoGameService.drawCardFromDeck() is deprecated. Use CardService.drawCardFromDeck() instead.')
    return await cardService.drawCardFromDeck(game.id)
  }

  async drawCardsForPlayer(game, playerId, count) {
    console.warn('UnoGameService.drawCardsForPlayer() is deprecated. Use CardService.drawCardsForPlayer() instead.')
    return await cardService.drawCardsForPlayer(game.id, playerId, count)
  }

  async addCardToPlayer(playerId, cardId) {
    console.warn('UnoGameService.addCardToPlayer() is deprecated. Use CardService.addCardToPlayer() instead.')
    return await cardService.addCardToPlayer(playerId, cardId)
  }

  async shuffleDiscardToDeck(game, _discard) {
    console.warn('UnoGameService.shuffleDiscardToDeck() is deprecated. Use CardService.shuffleDiscardToDeck() instead.')
    return await cardService.shuffleDiscardToDeck(game.id)
  }

  async getGameWithFullDetails(id) {
    console.warn('UnoGameService.getGameWithFullDetails() is deprecated. Use GameManagementService.getById() with full relations instead.')
    return await gameManagementService.getById(id)
  }

  async getTopGames(limit = 10) {
    console.warn('UnoGameService.getTopGames() is deprecated. Use GameManagementService.getTopGames() instead.')
    return await gameManagementService.getTopGames(limit)
  }
}

module.exports = new UnoGameService()
