const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../middleware/auth');

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findByUsernameOrEmail(username, email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Crear nuevo usuario
    const user = await userRepository.create({
      username,
      email,
      password
    });

    return user;
  }

  async login(username, password) {
    // Buscar usuario
    const user = await userRepository.findByUsername(username);

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generar token
    const token = generateToken(user.id);

    return { user, token };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();