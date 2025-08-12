const gameRepository = require('../repositories/GameRepository')

class GameService {
  async createGame(gameData, creatorId) {
    const { name, rules, maxPlayers } = gameData

    const game = await gameRepository.create({
      name,
      rules,
      maxPlayers: maxPlayers || 4,
      creatorId
    })

    // Agregar al creador como primer jugador
    await gameRepository.addPlayerToGame(creatorId, game.id, 1)

    return game
  }

  async joinGame(gameId, userId) {
    // Verificar si el juego existe
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not accepting new players')
    }

    // Verificar si el usuario ya está en el juego
    const existingPlayer = await gameRepository.findPlayerInGame(userId, gameId)

    if (existingPlayer) {
      throw new Error('User already in game')
    }

    // Verificar capacidad del juego
    const currentPlayers = await gameRepository.getPlayerCount(gameId)

    if (currentPlayers >= game.maxPlayers) {
      throw new Error('Game is full')
    }

    // Agregar jugador al juego
    await gameRepository.addPlayerToGame(userId, gameId, currentPlayers + 1)

    return game
  }

  async startGame(gameId, userId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.creatorId !== userId) {
      throw new Error('Only game creator can start the game')
    }

    if (game.status !== 'waiting') {
      throw new Error('Game cannot be started')
    }

    // Verificar que hay suficientes jugadores
    const players = await gameRepository.getGamePlayers(gameId)

    if (players.length < 2) {
      throw new Error('Need at least 2 players to start')
    }

    // Verificar que todos los jugadores estén listos
    const allReady = players.every(player => player.isReady)

    if (!allReady) {
      throw new Error('Not all players are ready')
    }

    // Inicializar el juego
    await gameRepository.update(gameId, {
      status: 'in_progress',
      currentPlayerId: players[0].userId
    })

    return game
  }

  async leaveGame(gameId, userId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    const gamePlayer = await gameRepository.findPlayerInGame(userId, gameId)

    if (!gamePlayer) {
      throw new Error('User not in game')
    }

    // Eliminar jugador del juego
    await gameRepository.removePlayerFromGame(userId, gameId)

    // Si era el creador y el juego no ha empezado, eliminar el juego
    if (game.creatorId === userId && game.status === 'waiting') {
      await gameRepository.delete(gameId)
    }

    return game
  }

  async endGame(gameId, userId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.creatorId !== userId) {
      throw new Error('Only game creator can end the game')
    }

    await gameRepository.update(gameId, { status: 'finished' })

    return game
  }

  async getGameState(gameId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    return {
      game_id: gameId,
      state: game.status
    }
  }

  async getGamePlayers(gameId) {
    const players = await gameRepository.getGamePlayers(gameId)
    const playerNames = players.map(player => player.User.username)

    return {
      game_id: gameId,
      players: playerNames
    }
  }

  async getCurrentPlayer(gameId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    let currentPlayer = null
    if (game.currentPlayerId) {
      const userRepository = require('../repositories/userRepository')
      const currentUser = await userRepository.findById(game.currentPlayerId)
      currentPlayer = currentUser ? currentUser.username : null
    }

    return {
      game_id: gameId,
      current_player: currentPlayer
    }
  }

  async getTopCard(gameId) {
    const game = await gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    return {
      game_id: gameId,
      top_card: game.topCard || 'No card'
    }
  }

  async getScores(gameId) {
    const players = await gameRepository.getGamePlayers(gameId)
    const scores = {}

    players.forEach(player => {
      scores[player.User.username] = player.score
    })

    return {
      game_id: gameId,
      scores
    }
  }
}

module.exports = new GameService()
