const container = require('./container')

/**
 * Service Registration - Configures dependency injection
 * Implements Dependency Inversion Principle (DIP)
 */
class ServiceRegistration {
  /**
   * Register all services in the container
   */
  static registerServices() {
    // Register repositories
    this.registerRepositories()

    // Register services
    this.registerBusinessServices()

    // Register controllers
    this.registerControllers()
  }

  /**
   * Register repository implementations
   */
  static registerRepositories() {
    // User Repository
    container.registerSingleton('userRepository', () => {
      const UserRepository = require('../../repositories/userRepository')
      return new UserRepository()
    }, [])

    // Game Repository
    container.registerSingleton('gameRepository', () => {
      const GameRepository = require('../../repositories/GameRepository')
      return new GameRepository()
    }, [])

    // Card Repository
    container.registerSingleton('cardRepository', () => {
      const CardRepository = require('../../repositories/cardRepository')
      return new CardRepository()
    }, [])

    // Game Participant Repository
    container.registerSingleton('gameParticipantRepository', () => {
      const GameParticipantRepository = require('../../repositories/gameParticipantRepository')
      return new GameParticipantRepository()
    }, [])
  }

  /**
   * Register business service implementations
   */
  static registerBusinessServices() {
    // User Authentication Service
    container.registerSingleton('userAuthService', (userRepository) => {
      const UserAuthenticationService = require('../services/UserAuthenticationService')
      return new UserAuthenticationService(userRepository, process.env.JWT_SECRET || 'test-secret')
    }, ['userRepository'])

    // User Service
    container.registerSingleton('userService', (userRepository) => {
      const UserService = require('../services/UserService')
      return new UserService(userRepository)
    }, ['userRepository'])

    // Game Management Service
    container.registerSingleton('gameManagementService', (gameRepository, gameParticipantRepository) => {
      const GameManagementService = require('../services/GameManagementService')
      return new GameManagementService(gameRepository, gameParticipantRepository)
    }, ['gameRepository', 'gameParticipantRepository'])

    // Card Service
    container.registerSingleton('cardService', (cardRepository, gameRepository) => {
      const CardService = require('../services/CardService')
      return new CardService(cardRepository, gameRepository)
    }, ['cardRepository', 'gameRepository'])

    // UNO Game Service
    container.registerSingleton('unoGameService', (gameRepository, gameParticipantRepository) => {
      const UnoGameService = require('../services/UnoGameService')
      return new UnoGameService(gameRepository, gameParticipantRepository)
    }, ['gameRepository', 'gameParticipantRepository'])

    // WebSocket Service
    container.registerSingleton('webSocketService', () => {
      const WebSocketService = require('../services/WebSocketService')
      return new WebSocketService()
    })

    // Logger Service
    container.registerSingleton('loggerService', () => {
      const LoggerService = require('../services/LoggerService')
      return LoggerService
    })
  }

  /**
   * Register controller implementations
   */
  static registerControllers() {
    // Auth Controller
    container.register('authController', (userAuthService, userService) => {
      const RefactoredAuthController = require('../controllers/RefactoredAuthController')
      return new RefactoredAuthController(userAuthService, userService)
    }, ['userAuthService', 'userService'])

    // Game Controller
    container.register('gameController', (gameManagementService, userService) => {
      const RefactoredGameController = require('../controllers/RefactoredGameController')
      return new RefactoredGameController(gameManagementService, userService)
    }, ['gameManagementService', 'userService'])

    // UNO Game Controller
    container.register('unoGameController', (unoGameService, userService) => {
      const UnoGameController = require('../controllers/UnoGameController')
      return new UnoGameController(unoGameService, userService)
    }, ['unoGameService', 'userService'])
  }

  /**
   * Get service from container
   * @param {string} serviceName - Name of the service
   * @returns {*} Service instance
   */
  static getService(serviceName) {
    return container.resolve(serviceName)
  }

  /**
   * Register a custom service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {Array} dependencies - Dependencies
   * @param {boolean} singleton - Whether to register as singleton
   */
  static registerCustomService(name, factory, dependencies = [], singleton = true) {
    if (singleton) {
      container.registerSingleton(name, factory, dependencies)
    } else {
      container.register(name, factory, dependencies)
    }
  }

  /**
   * Clear all registrations (useful for testing)
   */
  static clear() {
    container.clear()
  }
}

module.exports = ServiceRegistration
