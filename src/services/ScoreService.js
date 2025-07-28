const { ScoreRepository } = require("../repositories/ScoreRepository");
const { PlayerService } = require("./PlayerService");
const { GameService } = require("./GameService");

class ScoreService {
  constructor() {
    this.scoreRepository = new ScoreRepository();
    this.playerService = new PlayerService();
    this.gameService = new GameService();
  }

  async createScore(scoreData) {
    // Verificar que el jugador existe
    const player = await this.playerService.getPlayerById(scoreData.playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Verificar que el juego existe
    const game = await this.gameService.getGameById(scoreData.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const score = await this.scoreRepository.create(scoreData);

    // Actualizar estadísticas del jugador
    await this.playerService.updatePlayerStats(scoreData.playerId);

    return score;
  }

  async getAllScores() {
    return await this.scoreRepository.findAll({
      relations: ['player', 'game'],
      order: { createdAt: 'DESC' }
    });
  }

  async getScoreById(id) {
    return await this.scoreRepository.findById(id, {
      relations: ['player', 'game']
    });
  }

  async getScoresByPlayer(playerId) {
    // Verificar que el jugador existe
    const player = await this.playerService.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    return await this.scoreRepository.findByPlayerId(playerId);
  }

  async getScoresByGame(gameId) {
    // Verificar que el juego existe
    const game = await this.gameService.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    return await this.scoreRepository.findByGameId(gameId);
  }

  async getTopScores(gameId = null, limit = 10) {
    return await this.scoreRepository.findTopScores(gameId, limit);
  }

  async getPlayerBestScore(playerId, gameId) {
    return await this.scoreRepository.getPlayerBestScore(playerId, gameId);
  }

  async updateScore(id, updateData) {
    const existingScore = await this.scoreRepository.findById(id);
    if (!existingScore) {
      throw new Error('Score not found');
    }

    const updatedScore = await this.scoreRepository.update(id, updateData);

    // Actualizar estadísticas del jugador si cambió el score
    if (updateData.score !== undefined) {
      await this.playerService.updatePlayerStats(existingScore.playerId);
    }

    return updatedScore;
  }

  async deleteScore(id) {
    const score = await this.scoreRepository.findById(id);
    if (!score) {
      throw new Error('Score not found');
    }

    const deleted = await this.scoreRepository.delete(id);

    if (deleted) {
      // Actualizar estadísticas del jugador
      await this.playerService.updatePlayerStats(score.playerId);
    }

    return deleted;
  }
}

module.exports = { ScoreService };