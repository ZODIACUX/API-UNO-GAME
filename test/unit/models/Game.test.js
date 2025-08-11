const { User, Game, GamePlayer } = require('../../../src/database').models;

describe('Game Model - CRUD Operations', () => {
  let creator;

  beforeEach(async () => {
    creator = await User.create({
      username: 'gamecreator',
      email: 'creator@example.com',
      password: 'password123'
    });
  });

  describe('Create Game', () => {
    it('should create a new game with valid data', async () => {
      const gameData = {
        name: 'Test Game',
        rules: 'Standard UNO rules',
        maxPlayers: 4,
        creatorId: creator.id
      };

      const game = await Game.create(gameData);

      expect(game).toBeDefined();
      expect(game.name).toBe(gameData.name);
      expect(game.rules).toBe(gameData.rules);
      expect(game.maxPlayers).toBe(gameData.maxPlayers);
      expect(game.creatorId).toBe(creator.id);
      expect(game.status).toBe('waiting');
      expect(game.direction).toBe('clockwise');
    });

    it('should create game with default values', async () => {
      const game = await Game.create({
        name: 'Simple Game',
        creatorId: creator.id
      });

      expect(game.maxPlayers).toBe(4);
      expect(game.status).toBe('waiting');
      expect(game.direction).toBe('clockwise');
      expect(game.topCard).toBeNull();
    });

    it('should validate required fields', async () => {
      await expect(Game.create({
        rules: 'Some rules'
        // Missing name and creatorId
      })).rejects.toThrow();
    });

    it('should validate maxPlayers range', async () => {
      await expect(Game.create({
        name: 'Invalid Game',
        creatorId: creator.id,
        maxPlayers: 1 // Below minimum
      })).rejects.toThrow();

      await expect(Game.create({
        name: 'Invalid Game',
        creatorId: creator.id,
        maxPlayers: 15 // Above maximum
      })).rejects.toThrow();
    });
  });

  describe('Read Game', () => {
    let game;

    beforeEach(async () => {
      game = await Game.create({
        name: 'Read Test Game',
        rules: 'Test rules',
        maxPlayers: 6,
        creatorId: creator.id
      });
    });

    it('should find game by ID', async () => {
      const foundGame = await Game.findByPk(game.id);

      expect(foundGame).toBeDefined();
      expect(foundGame.name).toBe(game.name);
      expect(foundGame.creatorId).toBe(creator.id);
    });

    it('should find games by creator', async () => {
      const games = await Game.findAll({
        where: { creatorId: creator.id }
      });

      expect(games).toHaveLength(1);
      expect(games[0].id).toBe(game.id);
    });

    it('should find games by status', async () => {
      const waitingGames = await Game.findAll({
        where: { status: 'waiting' }
      });

      expect(waitingGames.length).toBeGreaterThan(0);
      expect(waitingGames.some(g => g.id === game.id)).toBe(true);
    });

    it('should include creator information', async () => {
      const gameWithCreator = await Game.findByPk(game.id, {
        include: [{ model: User, as: 'creator' }]
      });

      expect(gameWithCreator.creator).toBeDefined();
      expect(gameWithCreator.creator.username).toBe(creator.username);
    });

    it('should return null for non-existent game', async () => {
      const foundGame = await Game.findByPk(99999);
      expect(foundGame).toBeNull();
    });
  });

  describe('Update Game', () => {
    let game;

    beforeEach(async () => {
      game = await Game.create({
        name: 'Update Test Game',
        creatorId: creator.id
      });
    });

    it('should update game name', async () => {
      const newName = 'Updated Game Name';
      
      await game.update({ name: newName });
      await game.reload();

      expect(game.name).toBe(newName);
    });

    it('should update game status', async () => {
      await game.update({ status: 'in_progress' });
      await game.reload();

      expect(game.status).toBe('in_progress');
    });

    it('should update current player', async () => {
      await game.update({ currentPlayerId: creator.id });
      await game.reload();

      expect(game.currentPlayerId).toBe(creator.id);
    });

    it('should update game direction', async () => {
      await game.update({ direction: 'counterclockwise' });
      await game.reload();

      expect(game.direction).toBe('counterclockwise');
    });

    it('should update top card', async () => {
      const topCard = { color: 'red', type: 'number', value: '5' };
      
      await game.update({ topCard });
      await game.reload();

      expect(game.topCard).toEqual(topCard);
    });

    it('should validate status enum values', async () => {
      await expect(game.update({
        status: 'invalid_status'
      })).rejects.toThrow();
    });
  });

  describe('Delete Game', () => {
    let game;

    beforeEach(async () => {
      game = await Game.create({
        name: 'Delete Test Game',
        creatorId: creator.id
      });
    });

    it('should delete game successfully', async () => {
      const gameId = game.id;
      
      await game.destroy();
      
      const foundGame = await Game.findByPk(gameId);
      expect(foundGame).toBeNull();
    });

    it('should cascade delete game players', async () => {
      // Create a game player
      const gamePlayer = await GamePlayer.create({
        userId: creator.id,
        gameId: game.id,
        position: 1
      });

      const gameId = game.id;
      const gamePlayerId = gamePlayer.id;

      // Delete the game
      await game.destroy();

      // Verify game and game player are deleted
      const foundGame = await Game.findByPk(gameId);
      const foundGamePlayer = await GamePlayer.findByPk(gamePlayerId);

      expect(foundGame).toBeNull();
      expect(foundGamePlayer).toBeNull();
    });
  });
});
