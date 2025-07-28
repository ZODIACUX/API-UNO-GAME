const { PlayerRepository } = require("../repositories/PlayerRepository");
const { ScoreRepository } = require("../repositories/ScoreRepository");

class PlayerService {
  constructor() {
    this.playerRepository = new PlayerRepository();
    this.scoreRepository = new ScoreRepository();
  }

  async createPlayer(playerData) {
    // Verificar si el username ya existe
    const existingUsername = await this.playerRepository.findByUsername(playerData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Verificar si el email ya existe
    const existingEmail = await this.playerRepository.findByEmail(playerData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    return await this.playerRepository.create(playerData);
  }

  async getAllPlayers() {
    return await this.playerRepository.findAll();
  }

  async getPlayerById(id) {
    return await this.playerRepository.findById(id);
  }

  async getPlayerWithScores(id) {
    return await this.playerRepository.findWithScores(id);
  }

  async updatePlayer(id, updateData) {
    const existingPlayer = await this.playerRepository.findById(id);
    if (!existingPlayer) {
      throw new Error('Player not found');
    }

    // Verificar username único si se está actualizando
    if (updateData.username && updateData.username !== existingPlayer.username) {
      const existingUsername = await this.playerRepository.findByUsername(updateData.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }

    // Verificar email único si se está actualizando
    if (updateData.email && updateData.email !== existingPlayer.email) {
      const existingEmail = await this.playerRepository.findByEmail(updateData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    return await this.playerRepository.update(id, updateData);
  }

  async deletePlayer(id) {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new Error('Player not found');
    }

    return await this.playerRepository.delete(id);
  }

  async getTopPlayers(limit = 10) {
    return await this.playerRepository.getTopPlayers(limit);
  }

  async updatePlayerStats(playerId) {
    const scores = await this.scoreRepository.findByPlayerId(playerId);
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const gamesPlayed = scores.length;

    await this.playerRepository.update(playerId, {
      totalScore,
      gamesPlayed
    });
  }
}

module.exports = { PlayerService };
