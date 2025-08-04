const { PlayerService } = require('../services/PlayerService');
const { AppError } = require('../middleware/errorHandler');

class PlayerController {
  constructor() {
    this.playerService = new PlayerService();
  }

  createPlayer = async (req, res, next) => {
    try {
      const player = await this.playerService.createPlayer(req.body);
      res.status(201).json({
        success: true,
        message: 'Player created successfully',
        data: player
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getAllPlayers = async (req, res, next) => {
    try {
      const players = await this.playerService.getAllPlayers();
      res.status(200).json({
        success: true,
        message: 'Players retrieved successfully',
        data: players,
        count: players.length
      });
    } catch (error) {
      next(new AppError('Failed to retrieve players', 500));
    }
  };

  getPlayerById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const includeScores = req.query.includeScores === 'true';
      
      const player = includeScores 
        ? await this.playerService.getPlayerWithScores(id)
        : await this.playerService.getPlayerById(id);

      if (!player) {
        return next(new AppError('Player not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Player retrieved successfully',
        data: player
      });
    } catch (error) {
      next(new AppError('Failed to retrieve player', 500));
    }
  };

  updatePlayer = async (req, res, next) => {
    try {
      const { id } = req.params;
      const player = await this.playerService.updatePlayer(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Player updated successfully',
        data: player
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  deletePlayer = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.playerService.deletePlayer(id);

      res.status(200).json({
        success: true,
        message: 'Player deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getTopPlayers = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const players = await this.playerService.getTopPlayers(limit);

      res.status(200).json({
        success: true,
        message: 'Top players retrieved successfully',
        data: players,
        count: players.length
      });
    } catch (error) {
      next(new AppError('Failed to retrieve top players', 500));
    }
  };
}

module.exports = { PlayerController };