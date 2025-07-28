const { GameRepository } = require("../repositories/GameRepository");

class GameService {
  constructor() {
    this.gameRepository = new GameRepository();
  }

  async createGame(gameData) {
    // Validar que minPlayers no sea mayor que maxPlayers
    if (gameData.minPlayers && gameData.maxPlayers && gameData.minPlayers > gameData.maxPlayers) {
      throw new Error('Minimum players cannot be greater than maximum players');
    }

    return await this.gameRepository.create(gameData);
  }

  async getAllGames() {
    return await this.gameRepository.findAll();
  }

  async getActiveGames() {
    return await this.gameRepository.findActiveGames();
  }

  async getGameById(id) {
    return await this.gameRepository.findById(id);
  }

  async getGameWithScores(id) {
    return await this.gameRepository.findWithScores(id);
  }

  async getGamesByCategory(category) {
    return await this.gameRepository.findByCategory(category);
  }

  async updateGame(id, updateData) {
    const existingGame = await this.gameRepository.findById(id);
    if (!existingGame) {
      throw new Error('Game not found');
    }

    // Validar que minPlayers no sea mayor que maxPlayers
    const minPlayers = updateData.minPlayers ?? existingGame.minPlayers;
    const maxPlayers = updateData.maxPlayers ?? existingGame.maxPlayers;
    
    if (minPlayers > maxPlayers) {
      throw new Error('Minimum players cannot be greater than maximum players');
    }

    return await this.gameRepository.update(id, updateData);
  }

  async deleteGame(id) {
    const game = await this.gameRepository.findById(id);
    if (!game) {
      throw new Error('Game not found');
    }

    return await this.gameRepository.delete(id);
  }

  async deactivateGame(id) {
    return await this.updateGame(id, { isActive: false });
  }

  async activateGame(id) {
    return await this.updateGame(id, { isActive: true });
  }
}

module.exports = { GameService };
