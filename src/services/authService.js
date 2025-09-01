/**
 * LEGACY AUTH SERVICE - DEPRECATED
 *
 * This service has been refactored to follow SOLID principles.
 * Please use the new SOLID-compliant services instead:
 *
 * - UserAuthenticationService: For authentication operations
 * - UserService: For user management operations
 *
 * To get instances of these services, use the dependency injection container:
 *
 * const ServiceRegistration = require('../core/di/ServiceRegistration')
 * ServiceRegistration.registerServices()
 * const userAuthService = ServiceRegistration.getService('userAuthService')
 * const userService = ServiceRegistration.getService('userService')
 */

const ServiceRegistration = require('../core/di/ServiceRegistration')

// Initialize SOLID services
ServiceRegistration.registerServices()

// Get SOLID-compliant services
const userAuthService = ServiceRegistration.getService('userAuthService')
const userService = ServiceRegistration.getService('userService')

class AuthService {
  constructor() {
    console.warn('AuthService is deprecated. Use UserAuthenticationService and UserService instead.')
  }

  async register(userData) {
    console.warn('AuthService.register() is deprecated. Use UserService.register() instead.')
    return await userService.register(userData)
  }

  async login(username, password) {
    console.warn('AuthService.login() is deprecated. Use UserAuthenticationService.authenticateUser() instead.')

    const authResult = await userAuthService.authenticateUser(username, password)
    if (!authResult.isSuccess) {
      throw authResult.error
    }

    const tokenResult = await userAuthService.generateToken(
      authResult.value.id,
      authResult.value.username
    )

    if (!tokenResult.isSuccess) {
      throw tokenResult.error
    }

    return {
      user: authResult.value,
      token: tokenResult.value
    }
  }

  async getProfile(userId) {
    console.warn('AuthService.getProfile() is deprecated. Use UserService.getById() instead.')
    return await userService.getById(userId)
  }
}

module.exports = new AuthService()
