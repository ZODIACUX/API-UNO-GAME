const { GameService } = require('../services/GameService');
const { AppError } = require('../middleware/errorHandler');

class GameController {
  constructor() {
    this.gameService = new GameService();
  }

  createGame = async (req, res, next) => {
    try {
      const game = await this.gameService.createGame(req.body);
      res.status(201).json({
        success: true,
        message: 'Game created successfully',
        data: game
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getAllGames = async (req, res, next) => {
    try {
      const activeOnly = req.query.active === 'true';
      const category = req.query.category;

      let games;
      if (category) {
        games = await this.gameService.getGamesByCategory(category);
      } else if (activeOnly) {
        games = await this.gameService.getActiveGames();
      } else {
        games = await this.gameService.getAllGames();
      }

      res.status(200).json({
        success: true,
        message: 'Games retrieved successfully',
        data: games,
        count: games.length
      });
    } catch (error) {
      next(new AppError('Failed to retrieve games', 500));
    }
  };

  getGameById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const includeScores = req.query.includeScores === 'true';
      
      const game = includeScores 
        ? await this.gameService.getGameWithScores(id)
        : await this.gameService.getGameById(id);

      if (!game) {
        return next(new AppError('Game not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Game retrieved successfully',
        data: game
      });
    } catch (error) {
      next(new AppError('Failed to retrieve game', 500));
    }
  };

  updateGame = async (req, res, next) => {
    try {
      const { id } = req.params;
      const game = await this.gameService.updateGame(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Game updated successfully',
        data: game
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  deleteGame = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.gameService.deleteGame(id);

      res.status(200).json({
        success: true,
        message: 'Game deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };
}

module.exports = { GameController };
