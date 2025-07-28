const { CardService } = require('../services/CardService');
const { AppError } = require('../middleware/errorHandler');

class CardController {
  constructor() {
    this.cardService = new CardService();
  }

  createCard = async (req, res, next) => {
    try {
      const card = await this.cardService.createCard(req.body);
      res.status(201).json({
        success: true,
        message: 'Card created successfully',
        data: card
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  getAllCards = async (req, res, next) => {
    try {
      const activeOnly = req.query.active === 'true';
      const type = req.query.type;
      const rarity = req.query.rarity;

      let cards;
      if (type) {
        cards = await this.cardService.getCardsByType(type);
      } else if (rarity) {
        cards = await this.cardService.getCardsByRarity(rarity);
      } else if (activeOnly) {
        cards = await this.cardService.getActiveCards();
      } else {
        cards = await this.cardService.getAllCards();
      }

      res.status(200).json({
        success: true,
        message: 'Cards retrieved successfully',
        data: cards,
        count: cards.length
      });
    } catch (error) {
      next(new AppError('Failed to retrieve cards', 500));
    }
  };

  getCardById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const card = await this.cardService.getCardById(id);

      if (!card) {
        return next(new AppError('Card not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Card retrieved successfully',
        data: card
      });
    } catch (error) {
      next(new AppError('Failed to retrieve card', 500));
    }
  };

  updateCard = async (req, res, next) => {
    try {
      const { id } = req.params;
      const card = await this.cardService.updateCard(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Card updated successfully',
        data: card
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  deleteCard = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.cardService.deleteCard(id);

      res.status(200).json({
        success: true,
        message: 'Card deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  };

  initializeCards = async (req, res, next) => {
    try {
      const cards = await this.cardService.initializeCards();
      res.status(200).json({
        success: true,
        message: 'Cards initialized successfully',
        data: cards,
        count: cards.length
      });
    } catch (error) {
      next(new AppError('Failed to initialize cards', 500));
    }
  };
}

module.exports = { CardController };