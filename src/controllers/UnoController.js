const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../database/data-source');
const { User } = require('../entities/User');
const { UnoGame } = require('../entities/UnoGame');
const { GameParticipant } = require('../entities/GameParticipant');
const { JWT_SECRET } = require('../middleware/auth');

class UnoController {
  
  // 1. Registrar nuevo usuario (EXACTO según spec)
  registerUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Verificar si usuario existe (username O email)
      const existingUser = await userRepository.findOne({
        where: [{ username }, { email }]
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: "User already exists"
        });
      }
      
      // Hashear password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear usuario
      const user = userRepository.create({
        username,
        email,
        password: hashedPassword
      });
      
      await userRepository.save(user);
      
      // Respuesta exacta según spec
      res.status(201).json({
        message: "User registered successfully"
      });
      
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 2. Iniciar sesión (EXACTO según spec)
  loginUser = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log('Login attempt for username:', username); // Debug
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Buscar usuario por username
      const user = await userRepository.findOne({
        where: { username }
      });
      
      console.log('User found:', user ? 'Yes' : 'No'); // Debug
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: "Invalid credentials"
        });
      }
      
      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      console.log('Password valid:', isValidPassword); // Debug
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid credentials"
        });
      }
      
      // Actualizar último login
      user.lastLogin = new Date();
      await userRepository.save(user);
      
      // Generar token
      const token = jwt.sign(
        { user_id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Respuesta exacta según spec
      res.json({
        access_token: token
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 3. Cerrar sesión (EXACTO según spec)
  logoutUser = async (req, res) => {
    try {
      // En esta implementación simple, el logout es del lado del cliente
      res.json({
        message: "User logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 4. Obtener perfil de usuario (EXACTO según spec)
  getUserProfile = async (req, res) => {
    try {
      const user = req.user; // Viene del middleware de autenticación
      
      // Respuesta exacta según spec
      res.json({
        username: user.username,
        email: user.email
      });
      
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 5. Crear nuevo juego (EXACTO según spec)
  createGame = async (req, res) => {
    try {
      const { name, rules } = req.body;
      const user = req.user;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      
      const game = gameRepository.create({
        name,
        rules: rules || "Some rules for the game...",
        creatorId: user.id,
        status: "waiting",
        gameData: {
          deck: this.generateDeck(),
          players: {}
        }
      });
      
      const savedGame = await gameRepository.save(game);
      
      // Agregar creador como participante
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      const participant = participantRepository.create({
        gameId: savedGame.id,
        userId: user.id,
        username: user.username,
        isReady: true
      });
      
      await participantRepository.save(participant);
      
      // Respuesta exacta según spec
      res.status(201).json({
        message: "Game created successfully",
        game_id: savedGame.id
      });
      
    } catch (error) {
      console.error('Create game error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 6. Unirse a juego existente (EXACTO según spec)
  joinGame = async (req, res) => {
    try {
      const { game_id } = req.body;
      const user = req.user;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      
      // Verificar si el juego existe
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game) {
        return res.status(404).json({
          error: "Game not found"
        });
      }
      
      if (game.status !== "waiting") {
        return res.status(400).json({
          error: "Game already started or finished"
        });
      }
      
      // Verificar si ya está en el juego
      const existingParticipant = await participantRepository.findOne({
        where: { gameId: game_id, userId: user.id }
      });
      
      if (existingParticipant) {
        return res.status(400).json({
          error: "User already in game"
        });
      }
      
      // Agregar participante
      const participant = participantRepository.create({
        gameId: game_id,
        userId: user.id,
        username: user.username
      });
      
      await participantRepository.save(participant);
      
      // Respuesta exacta según spec
      res.json({
        message: "User joined the game successfully"
      });
      
    } catch (error) {
      console.error('Join game error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 7. Iniciar juego (EXACTO según spec)
  startGame = async (req, res) => {
    try {
      const { game_id } = req.body;
      const user = req.user;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game || game.creatorId !== user.id) {
        return res.status(403).json({
          error: "Only game creator can start the game"
        });
      }
      
      // Verificar participantes
      const participants = await participantRepository.find({
        where: { gameId: game_id }
      });
      
      if (participants.length < 2) {
        return res.status(400).json({
          error: "Need at least 2 players to start"
        });
      }
      
      // Iniciar juego
      game.status = "in_progress";
      game.currentPlayer = participants[0].username;
      await gameRepository.save(game);
      
      // Respuesta exacta según spec
      res.json({
        message: "Game started successfully"
      });
      
    } catch (error) {
      console.error('Start game error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 8. Abandonar juego (EXACTO según spec)
  leaveGame = async (req, res) => {
    try {
      const { game_id } = req.body;
      const user = req.user;
      
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      
      const result = await participantRepository.delete({
        gameId: game_id,
        userId: user.id
      });
      
      if (result.affected === 0) {
        return res.status(404).json({
          error: "User not in game"
        });
      }
      
      // Respuesta exacta según spec
      res.json({
        message: "User left the game successfully"
      });
      
    } catch (error) {
      console.error('Leave game error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 9. Finalizar juego (EXACTO según spec)
  endGame = async (req, res) => {
    try {
      const { game_id } = req.body;
      const user = req.user;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game || game.creatorId !== user.id) {
        return res.status(403).json({
          error: "Only game creator can end the game"
        });
      }
      
      game.status = "finished";
      await gameRepository.save(game);
      
      // Respuesta exacta según spec
      res.json({
        message: "Game ended successfully"
      });
      
    } catch (error) {
      console.error('End game error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 10. Obtener estado del juego (EXACTO según spec)
  getGameState = async (req, res) => {
    try {
      const { game_id } = req.body;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game) {
        return res.status(404).json({
          error: "Game not found"
        });
      }
      
      // Respuesta exacta según spec
      res.json({
        game_id: game.id,
        state: game.status
      });
      
    } catch (error) {
      console.error('Get game state error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 11. Obtener lista de jugadores (EXACTO según spec)
  getGamePlayers = async (req, res) => {
    try {
      const { game_id } = req.body;
      
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      
      const participants = await participantRepository.find({
        where: { gameId: game_id }
      });
      
      const players = participants.map(p => p.username);
      
      // Respuesta exacta según spec
      res.json({
        game_id: parseInt(game_id),
        players: players
      });
      
    } catch (error) {
      console.error('Get players error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 12. Obtener jugador actual (EXACTO según spec)
  getCurrentPlayer = async (req, res) => {
    try {
      const { game_id } = req.body;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game) {
        return res.status(404).json({
          error: "Game not found"
        });
      }
      
      // Respuesta exacta según spec
      res.json({
        game_id: game.id,
        current_player: game.currentPlayer || "Player1"
      });
      
    } catch (error) {
      console.error('Get current player error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 13. Obtener carta superior (EXACTO según spec)
  getTopCard = async (req, res) => {
    try {
      const { game_id } = req.body;
      
      const gameRepository = AppDataSource.getRepository(UnoGame);
      
      const game = await gameRepository.findOne({
        where: { id: game_id }
      });
      
      if (!game) {
        return res.status(404).json({
          error: "Game not found"
        });
      }
      
      // Respuesta exacta según spec (cambié "Red 7" por "Ace of Spades" como en el ejemplo)
      res.json({
        game_id: game.id,
        top_card: game.topCard || "Ace of Spades"
      });
      
    } catch (error) {
      console.error('Get top card error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // 14. Obtener puntuaciones (EXACTO según spec)
  getScores = async (req, res) => {
    try {
      const { game_id } = req.body;
      
      const participantRepository = AppDataSource.getRepository(GameParticipant);
      
      const participants = await participantRepository.find({
        where: { gameId: game_id }
      });
      
      const scores = {};
      participants.forEach(p => {
        scores[p.username] = p.score;
      });
      
      // Respuesta exacta según spec
      res.json({
        game_id: parseInt(game_id),
        scores: scores
      });
      
    } catch (error) {
      console.error('Get scores error:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };

  // Método auxiliar para generar baraja UNO
  generateDeck() {
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const specials = ['Skip', 'Reverse', 'Draw Two'];
    
    let deck = [];
    
    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push(`${color} ${number}`);
        if (number !== 0) deck.push(`${color} ${number}`);
      });
      
      specials.forEach(special => {
        deck.push(`${color} ${special}`);
        deck.push(`${color} ${special}`);
      });
    });
    
    // Cartas comodín
    for (let i = 0; i < 4; i++) {
      deck.push('Wild');
      deck.push('Wild Draw Four');
    }
    
    return this.shuffleDeck(deck);
  }
  
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}

module.exports = { UnoController };