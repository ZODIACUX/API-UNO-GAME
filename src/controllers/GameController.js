import gameService from '../services/GameService.js';
import logger from '../utils-api/logger.js';

const createGame = async (req, res) => {
  try {
    const gameData = req.body;
    const creatorId = req.user.id;
    
    const game = await gameService.createGame(gameData, creatorId);
    
    logger.info('Game created successfully', { gameId: game.id, creatorId });
    
    res.status(201).json({
      message: 'Game created successfully',
      game_id: game.id
    });

  } catch (error) {
    logger.error('Create game error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const joinGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.id;
    
    await gameService.joinGame(game_id, userId);
    
    logger.info('User joined game', { gameId: game_id, userId });
    
    res.json({
      message: 'User joined the game successfully'
    });

  } catch (error) {
    logger.error('Join game error', { error: error.message });
    
    if (['Game not found', 'Game is not accepting new players', 'User already in game', 'Game is full'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const startGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.id;
    
    await gameService.startGame(game_id, userId);
    
    logger.info('Game started', { gameId: game_id, startedBy: userId });
    
    res.json({
      message: 'Game started successfully'
    });

  } catch (error) {
    logger.error('Start game error', { error: error.message });
    
    if (['Game not found', 'Only game creator can start the game', 'Game cannot be started', 'Need at least 2 players to start', 'Not all players are ready'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const leaveGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.id;
    
    await gameService.leaveGame(game_id, userId);
    
    logger.info('User left game', { gameId: game_id, userId });
    
    res.json({
      message: 'User left the game successfully'
    });

  } catch (error) {
    logger.error('Leave game error', { error: error.message });
    
    if (['Game not found', 'User not in game'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const endGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.id;
    
    await gameService.endGame(game_id, userId);
    
    logger.info('Game ended', { gameId: game_id, endedBy: userId });
    
    res.json({
      message: 'Game ended successfully'
    });

  } catch (error) {
    logger.error('End game error', { error: error.message });
    
    if (['Game not found', 'Only game creator can end the game'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getGameState = async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const result = await gameService.getGameState(gameId);
    
    res.json(result);

  } catch (error) {
    logger.error('Get game state error', { error: error.message });
    
    if (error.message === 'Game not found') {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getGamePlayers = async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const result = await gameService.getGamePlayers(gameId);
    
    res.json(result);

  } catch (error) {
    logger.error('Get game players error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentPlayer = async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const result = await gameService.getCurrentPlayer(gameId);
    
    res.json(result);

  } catch (error) {
    logger.error('Get current player error', { error: error.message });
    
    if (error.message === 'Game not found') {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getTopCard = async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const result = await gameService.getTopCard(gameId);
    
    res.json(result);

  } catch (error) {
    logger.error('Get top card error', { error: error.message });
    
    if (error.message === 'Game not found') {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getScores = async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const result = await gameService.getScores(gameId);
    
    res.json(result);

  } catch (error) {
    logger.error('Get scores error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  createGame,
  joinGame,
  startGame,
  leaveGame,
  endGame,
  getGameState,
  getGamePlayers,
  getCurrentPlayer,
  getTopCard,
  getScores
};