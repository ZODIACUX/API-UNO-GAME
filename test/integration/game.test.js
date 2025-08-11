const request = require('supertest');
const app = require('../../index');

describe('Game Management Integration Tests', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    // Create and login user for game tests
    const userData = {
      username: 'gameuser_' + Date.now(),
      email: `gameuser_${Date.now()}@example.com`,
      password: 'password123'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: userData.username,
        password: userData.password
      });

    userToken = loginResponse.body.access_token;
  });

  describe('10. Create New Game', () => {
    it('should create a new game with valid data', async () => {
      const gameData = {
        name: 'Test UNO Game',
        rules: 'Standard UNO rules',
        maxPlayers: 4
      };

      const response = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(gameData)
        .expect(201);

      expect(response.body.message).toBe('Game created successfully');
      expect(response.body).toHaveProperty('game_id');
      expect(typeof response.body.game_id).toBe('number');
    });

    it('should create game with minimal valid data', async () => {
      const gameData = {
        name: 'Minimal Game'
      };

      const response = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(gameData)
        .expect(201);

      expect(response.body).toHaveProperty('game_id');
    });

    it('should reject game creation with missing data', async () => {
      const gameData = {
        // Missing required name field
        rules: 'Some rules'
      };

      const response = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(gameData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject game creation without authentication', async () => {
      const gameData = {
        name: 'Unauthorized Game'
      };

      const response = await request(app)
        .post('/api/game/create')
        .send(gameData)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should handle errors with incorrect or missing data', async () => {
      const gameData = {
        name: '', // Empty name
        maxPlayers: 15 // Exceeds maximum
      };

      const response = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(gameData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('11. Join Existing Game', () => {
    let gameId;

    beforeEach(async () => {
      // Create a game to join
      const gameResponse = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Join Test Game',
          maxPlayers: 4
        });

      gameId = gameResponse.body.game_id;
    });

    it('should join existing game successfully', async () => {
      // Create second user
      const user2Data = {
        username: 'joiner_' + Date.now(),
        email: `joiner_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      const user2Token = loginResponse.body.access_token;

      const response = await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ game_id: gameId })
        .expect(200);

      expect(response.body.message).toBe('User joined the game successfully');
    });

    it('should reject joining non-existent game', async () => {
      const response = await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: 99999 })
        .expect(400);

      expect(response.body.error).toBe('Game not found');
    });

    it('should reject joining when game is full', async () => {
      // Create a game with max 2 players
      const smallGameResponse = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Small Game',
          maxPlayers: 2
        });

      const smallGameId = smallGameResponse.body.game_id;

      // Create and add second user
      const user2Data = {
        username: 'user2_' + Date.now(),
        email: `user2_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: smallGameId });

      // Try to add third user (should fail)
      const user3Data = {
        username: 'user3_' + Date.now(),
        email: `user3_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user3Data);

      const user3Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user3Data.username,
          password: user3Data.password
        });

      const response = await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user3Login.body.access_token}`)
        .send({ game_id: smallGameId })
        .expect(400);

      expect(response.body.error).toBe('Game is full');
    });

    it('should handle joining game that is not available', async () => {
      // Start the game first
      await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId });

      // Create new user trying to join started game
      const newUserData = {
        username: 'latecomer_' + Date.now(),
        email: `latecomer_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUserData);

      const newUserLogin = await request(app)
        .post('/api/auth/login')
        .send({
          username: newUserData.username,
          password: newUserData.password
        });

      const response = await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${newUserLogin.body.access_token}`)
        .send({ game_id: gameId })
        .expect(400);

      expect(response.body.error).toBe('Game is not accepting new players');
    });
  });

  describe('12. Start Game When Players Ready', () => {
    let gameId;

    beforeEach(async () => {
      const gameResponse = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Start Test Game',
          maxPlayers: 4
        });

      gameId = gameResponse.body.game_id;
    });

    it('should start game when all players are ready', async () => {
      // Add second player
      const user2Data = {
        username: 'player2_' + Date.now(),
        email: `player2_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId });

      // Start game
      const response = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId })
        .expect(200);

      expect(response.body.message).toBe('Game started successfully');
    });

    it('should reject start when not enough players', async () => {
      // Try to start with only creator (need at least 2)
      const response = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId })
        .expect(400);

      expect(response.body.error).toBe('Need at least 2 players to start');
    });

    it('should reject start when user is not game creator', async () => {
      // Create second user
      const user2Data = {
        username: 'notcreator_' + Date.now(),
        email: `notcreator_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId });

      // Try to start game with non-creator
      const response = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId })
        .expect(400);

      expect(response.body.error).toBe('Only game creator can start the game');
    });

    it('should handle start when game has already begun', async () => {
      // Add player and start game
      const user2Data = {
        username: 'player2_' + Date.now(),
        email: `player2_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId });

      await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId });

      // Try to start again
      const response = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId })
        .expect(400);

      expect(response.body.error).toBe('Game cannot be started');
    });
  });

  describe('13. Leave Game in Progress', () => {
    let gameId;

    beforeEach(async () => {
      const gameResponse = await request(app)
        .post('/api/game/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Leave Test Game'
        });

      gameId = gameResponse.body.game_id;
    });

    it('should leave game successfully', async () => {
      // Join with second user
      const user2Data = {
        username: 'leaver_' + Date.now(),
        email: `leaver_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Login = await request(app)
        .post('/api/auth/login')
        .send({
          username: user2Data.username,
          password: user2Data.password
        });

      await request(app)
        .post('/api/game/join')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId });

      // Leave game
      const response = await request(app)
        .post('/api/game/leave')
        .set('Authorization', `Bearer ${user2Login.body.access_token}`)
        .send({ game_id: gameId })
        .expect(200);

      expect(response.body.message).toBe('User left the game successfully');
    });

    it('should handle leaving when user not in game', async () => {
      // Create user not in game
      const outsiderData = {
        username: 'outsider_' + Date.now(),
        email: `outsider_${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(outsiderData);

      const outsiderLogin = await request(app)
        .post('/api/auth/login')
        .send({
          username: outsiderData.username,
          password: outsiderData.password
        });

      const response = await request(app)
        .post('/api/game/leave')
        .set('Authorization', `Bearer ${outsiderLogin.body.access_token}`)
        .send({ game_id: gameId })
        .expect(400);

      expect(response.body.error).toBe('User not in game');
    });

    it('should handle leaving non-existent game', async () => {
      const response = await request(app)
        .post('/api/game/leave')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: 99999 })
        .expect(400);

      expect(response.body.error).toBe('Game not found');
    });

    it('should delete game when creator leaves waiting game', async () => {
      // Creator leaves waiting game
      const response = await request(app)
        .post('/api/game/leave')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ game_id: gameId })
        .expect(200);