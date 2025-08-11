const { User, Game, GamePlayer } = require('../../../src/database').models;

describe('GamePlayer Model - Score Management', () => {
  let user, game;

  beforeEach(async () => {
    user = await User.create({
      username: 'player1',
      email: 'player1@example.com',
      password: 'password123'
    });

    game = await Game.create({
      name: 'Score Test Game',
      creatorId: user.id
    });
  });

  describe('Create Score Record', () => {
    it('should create a new game player with score', async () => {
      const gamePlayerData = {
        userId: user.id,
        gameId: game.id,
        position: 1,
        score: 150,
        isReady: true,
        cardsCount: 5
      };

      const gamePlayer = await GamePlayer.create(gamePlayerData);

      expect(gamePlayer).toBeDefined();
      expect(gamePlayer.userId).toBe(user.id);
      expect(gamePlayer.gameId).toBe(game.id);
      expect(gamePlayer.score).toBe(150);
      expect(gamePlayer.position).toBe(1);
      expect(gamePlayer.isReady).toBe(true);
      expect(gamePlayer.cardsCount).toBe(5);
    });

    it('should create with default values', async () => {
      const gamePlayer = await GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 1
      });

      expect(gamePlayer.score).toBe(0);
      expect(gamePlayer.isReady).toBe(false);
      expect(gamePlayer.cardsCount).toBe(7);
    });

    it('should prevent duplicate user-game combinations', async () => {
      await GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 1
      });

      await expect(GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 2
      })).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(GamePlayer.create({
        userId: user.id
        // Missing gameId and position
      })).rejects.toThrow();
    });
  });

  describe('Read Score Records', () => {
    let gamePlayer;

    beforeEach(async () => {
      gamePlayer = await GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 1,
        score: 250
      });
    });

    it('should find game player by ID', async () => {
      const found = await GamePlayer.findByPk(gamePlayer.id);

      expect(found).toBeDefined();
      expect(found.score).toBe(250);
      expect(found.userId).toBe(user.id);
    });

    it('should find game players by game', async () => {
      const players = await GamePlayer.findAll({
        where: { gameId: game.id }
      });

      expect(players).toHaveLength(1);
      expect(players[0].id).toBe(gamePlayer.id);
    });

    it('should find game players by user', async () => {
      const players = await GamePlayer.findAll({
        where: { userId: user.id }
      });

      expect(players).toHaveLength(1);
      expect(players[0].score).toBe(250);
    });

    it('should include user and game information', async () => {
      const playerWithInfo = await GamePlayer.findByPk(gamePlayer.id, {
        include: [
          { model: User, attributes: ['username', 'email'] },
          { model: Game, attributes: ['name', 'status'] }
        ]
      });

      expect(playerWithInfo.User).toBeDefined();
      expect(playerWithInfo.User.username).toBe(user.username);
      expect(playerWithInfo.Game).toBeDefined();
      expect(playerWithInfo.Game.name).toBe(game.name);
    });

    it('should order players by position', async () => {
      const user2 = await User.create({
        username: 'player2',
        email: 'player2@example.com',
        password: 'password123'
      });

      await GamePlayer.create({
        userId: user2.id,
        gameId: game.id,
        position: 2,
        score: 100
      });

      const players = await GamePlayer.findAll({
        where: { gameId: game.id },
        order: [['position', 'ASC']]
      });

      expect(players).toHaveLength(2);
      expect(players[0].position).toBe(1);
      expect(players[1].position).toBe(2);
    });
  });

  describe('Update Score Records', () => {
    let gamePlayer;

    beforeEach(async () => {
      gamePlayer = await GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 1,
        score: 100
      });
    });

    it('should update player score', async () => {
      await gamePlayer.update({ score: 350 });
      await gamePlayer.reload();

      expect(gamePlayer.score).toBe(350);
    });

    it('should update ready status', async () => {
      await gamePlayer.update({ isReady: true });
      await gamePlayer.reload();

      expect(gamePlayer.isReady).toBe(true);
    });

    it('should update cards count', async () => {
      await gamePlayer.update({ cardsCount: 3 });
      await gamePlayer.reload();

      expect(gamePlayer.cardsCount).toBe(3);
    });

    it('should update position', async () => {
      await gamePlayer.update({ position: 3 });
      await gamePlayer.reload();

      expect(gamePlayer.position).toBe(3);
    });

    it('should increment score', async () => {
      const initialScore = gamePlayer.score;
      
      await gamePlayer.increment('score', { by: 50 });
      await gamePlayer.reload();

      expect(gamePlayer.score).toBe(initialScore + 50);
    });
  });

  describe('Delete Score Records', () => {
    let gamePlayer;

    beforeEach(async () => {
      gamePlayer = await GamePlayer.create({
        userId: user.id,
        gameId: game.id,
        position: 1,
        score: 200
      });
    });

    it('should delete game player record', async () => {
      const gamePlayerId = gamePlayer.id;
      
      await gamePlayer.destroy();
      
      const found = await GamePlayer.findByPk(gamePlayerId);
      expect(found).toBeNull();
    });

    it('should delete all players from a game', async () => {
      const user2 = await User.create({
        username: 'player2',
        email: 'player2@example.com',
        password: 'password123'
      });

      await GamePlayer.create({
        userId: user2.id,
        gameId: game.id,
        position: 2,
        score: 150
      });

      const