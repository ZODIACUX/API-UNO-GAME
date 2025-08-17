const BaseService = require('./BaseService')
const Result = require('../errors/Result')

/**
 * Service responsible for game management operations
 * Follows Single Responsibility Principle - only handles game lifecycle management
 */
class GameManagementService extends BaseService {
  constructor(gameRepository, participantRepository) {
    super(gameRepository)
    this.participantRepository = participantRepository
  }

  async createGame(gameData, creatorId, creatorUsername) {
    return Result.fromAsync(async () => {
      const { name, rules } = gameData

      const game = {
        name,
        rules: rules || 'Standard UNO rules apply',
        creatorId,
        status: 'waiting',
        gameData: {
          deck: this.generateDeck(),
          players: {}
        }
      }

      const createResult = await this.repository.create(game)
      if (!createResult.isSuccess) {
        throw new Error('Failed to create game')
      }

      const savedGame = createResult.value

      // Add creator as participant
      const participantResult = await this.participantRepository.create({
        gameId: savedGame.id,
        userId: creatorId,
        username: creatorUsername,
        isReady: true
      })

      if (!participantResult.isSuccess) {
        throw new Error('Failed to add creator as participant')
      }

      return savedGame
    })
  }

  async joinGame(gameId, userId, username) {
    return Result.fromAsync(async () => {
      // Check if game exists and is joinable
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.status !== 'waiting') {
        throw new Error('Game already started or finished')
      }

      // Check if user is already in the game
      const existingParticipant = await this.participantRepository.findBy({
        gameId,
        userId
      })

      if (existingParticipant.isSuccess && existingParticipant.value) {
        throw new Error('User already in game')
      }

      // Add participant
      const participantResult = await this.participantRepository.create({
        gameId,
        userId,
        username
      })

      if (!participantResult.isSuccess) {
        throw new Error('Failed to join game')
      }

      return participantResult.value
    })
  }

  async startGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.creatorId !== userId) {
        throw new Error('Only game creator can start the game')
      }

      // Check minimum players
      const participantsResult = await this.participantRepository.findBy({ gameId })
      if (!participantsResult.isSuccess) {
        throw new Error('Failed to get participants')
      }

      const participants = participantsResult.value
      if (!Array.isArray(participants) || participants.length < 2) {
        throw new Error('Need at least 2 players to start')
      }

      // Start the game
      const updateResult = await this.repository.update(gameId, {
        status: 'in_progress',
        currentPlayer: participants[0].username
      })

      if (!updateResult.isSuccess) {
        throw new Error('Failed to start game')
      }

      return true
    })
  }

  async endGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      if (game.creatorId !== userId) {
        throw new Error('Only game creator can end the game')
      }

      const updateResult = await this.repository.update(gameId, {
        status: 'finished'
      })

      if (!updateResult.isSuccess) {
        throw new Error('Failed to end game')
      }

      return true
    })
  }

  async leaveGame(gameId, userId) {
    return Result.fromAsync(async () => {
      const deleteResult = await this.participantRepository.delete({
        gameId,
        userId
      })

      if (!deleteResult.isSuccess) {
        throw new Error('User not in game')
      }

      return true
    })
  }

  async getGameState(gameId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      return {
        game_id: game.id,
        state: game.status
      }
    })
  }

  async getGamePlayers(gameId) {
    return Result.fromAsync(async () => {
      const participantsResult = await this.participantRepository.findBy({ gameId })
      if (!participantsResult.isSuccess) {
        throw new Error('Failed to get participants')
      }

      const participants = participantsResult.value
      const players = Array.isArray(participants)
        ? participants.map(p => p.username)
        : []

      return {
        game_id: parseInt(gameId),
        players
      }
    })
  }

  async getCurrentPlayer(gameId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      return {
        game_id: game.id,
        current_player: game.currentPlayer || 'Player1'
      }
    })
  }

  async getTopCard(gameId) {
    return Result.fromAsync(async () => {
      const gameResult = await this.repository.findById(gameId)
      if (!gameResult.isSuccess) {
        throw new Error('Game not found')
      }

      const game = gameResult.value
      return {
        game_id: game.id,
        top_card: game.topCard || 'Ace of Spades'
      }
    })
  }

  async getScores(gameId) {
    return Result.fromAsync(async () => {
      const participantsResult = await this.participantRepository.findBy({ gameId })
      if (!participantsResult.isSuccess) {
        throw new Error('Failed to get participants')
      }

      const participants = participantsResult.value
      const scores = {}

      if (Array.isArray(participants)) {
        participants.forEach(p => {
          scores[p.username] = p.score || 0
        })
      }

      return {
        game_id: parseInt(gameId),
        scores
      }
    })
  }

  // Utility method for generating UNO deck
  generateDeck() {
    const colors = ['Red', 'Blue', 'Green', 'Yellow']
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const specials = ['Skip', 'Reverse', 'Draw Two']

    let deck = []

    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push(`${color} ${number}`)
        if (number !== 0) deck.push(`${color} ${number}`)
      })

      specials.forEach(special => {
        deck.push(`${color} ${special}`)
        deck.push(`${color} ${special}`)
      })
    })

    // Wild cards
    for (let i = 0; i < 4; i++) {
      deck.push('Wild')
      deck.push('Wild Draw Four')
    }

    return this.shuffleDeck(deck)
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }
}

module.exports = GameManagementService
