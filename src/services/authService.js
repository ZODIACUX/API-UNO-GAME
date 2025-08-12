const userRepository = require('../repositories/userRepository')
const { generateToken } = require('../middleware/auth')

class AuthService {
  async register(userData) {
    const { username, email, password } = userData

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findByUsernameOrEmail(username, email)

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Crear nuevo usuario
    const user = await userRepository.create({
      username,
      email,
      password
    })

    return user
  }

  async login(username, password) {
    // Validate input
    if (!username || !password) {
      throw new Error('Invalid credentials')
    }

    // Buscar usuario con contraseña incluida
    const user = await userRepository.findByUsernameWithPassword(username)

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials')
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generar token
    const token = generateToken(user.id)

    // Retornar usuario sin contraseña
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  async getProfile(userId) {
    // Validate input
    if (!userId || userId === null || userId === undefined) {
      throw new Error('User not found')
    }

    const user = await userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}

module.exports = new AuthService()
