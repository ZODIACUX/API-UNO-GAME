const ServiceLocator = require('./serviceLocator')

const userRepository = require('../../repositories/userRepository')
const gameRepository = require('../../repositories/GameRepository')
const cardRepository = require('../../repositories/cardRepository')

const AuthService = require('../../services/authService')
const LegacyGameService = require('../../services/GameService')
const LegacyCardService = require('../../services/cardService')

const UserService = require('../services/UserService')
const GameService = require('../services/GameService')
const AuthenticationService = require('../services/AuthenticationService')
const CardService = require('../services/CardService')

class ServiceRegistration {
  static register() {
    const serviceLocator = ServiceLocator.getInstance()

    serviceLocator.registerSingleton('userRepository', () => userRepository)
    serviceLocator.registerSingleton('gameRepository', () => gameRepository)
    serviceLocator.registerSingleton('cardRepository', () => cardRepository)

    serviceLocator.registerSingleton('userService',
      (userRepo) => new UserService(userRepo),
      ['userRepository']
    )

    serviceLocator.registerSingleton('authenticationService',
      (userRepo) => new AuthenticationService(userRepo),
      ['userRepository']
    )

    serviceLocator.registerSingleton('gameService',
      (gameRepo, userRepo) => new GameService(gameRepo, userRepo),
      ['gameRepository', 'userRepository']
    )

    serviceLocator.registerSingleton('cardService',
      (cardRepo) => new CardService(cardRepo),
      ['cardRepository']
    )

    serviceLocator.registerSingleton('authService', () => AuthService)
    serviceLocator.registerSingleton('legacyGameService', () => LegacyGameService)
    serviceLocator.registerSingleton('legacyCardService', () => LegacyCardService)

    return serviceLocator
  }

  static getService(name) {
    return ServiceLocator.getInstance().resolve(name)
  }
}

module.exports = ServiceRegistration
