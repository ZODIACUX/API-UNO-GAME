const { ScoreService } = require('../services/ScoreService');
const { AppError } = require('../middleware/errorHandler');

class ScoreController {
  constructor() {
    this.scoreService = new ScoreService();
  }

  createScore = async (req, res, next) => {
    try {
      const score = await this.scoreService.createScore(req.body);
      res.status(201).json({
        success: true,
        message: 'Score created successfully',
        data: score
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getAllScores = async (req, res, next) => {
    try {
      const playerId = req.query.playerId;
      const gameId = req.query.gameId;

      let scores;
      if (playerId) {
        scores = await this.scoreService.getScoresByPlayer(playerId);
      } else if (gameId) {
        scores = await this.scoreService.getScoresByGame(gameId);
      } else {
        scores = await this.scoreService.getAllScores();
      }

      res.status(200).json({
        success: true,
        message: 'Scores retrieved successfully',
        data: scores,
        count: scores.length
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getScoreById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const score = await this.scoreService.getScoreById(id);

      if (!score) {
        return next(new AppError('Score not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Score retrieved successfully',
        data: score
      });
    } catch (error) {
      next(new AppError('Failed to retrieve score', 500));
    }
  };

  updateScore = async (req, res, next) => {
    try {
      const { id } = req.params;
      const score = await this.scoreService.updateScore(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Score updated successfully',
        data: score
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  deleteScore = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.scoreService.deleteScore(id);

      res.status(200).json({
        success: true,
        message: 'Score deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getTopScores = async (req, res, next) => {
    try {
      const gameId = req.query.gameId;
      const limit = parseInt(req.query.limit) || 10;
      
      const scores = await this.scoreService.getTopScores(gameId, limit);

      res.status(200).json({
        success: true,
        message: 'Top scores retrieved successfully',
        data: scores,
        count: scores.length
      });
    } catch (error) {
      next(new AppError('Failed to retrieve top scores', 500));
    }
  };
}

module.exports = { ScoreController };