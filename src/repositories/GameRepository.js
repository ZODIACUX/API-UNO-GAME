const database = require('../database')

class GameRepository {
  async findById(id) {
    return await database.models.Game.findByPk(id)
  }

  async findByIdWithPlayers(id) {
    return await database.models.Game.findByPk(id, {
      include: [{
        model: database.models.User,
        through: { model: database.models.GamePlayer },
        attributes: ['id', 'username']
      }]
    })
  }

  async create(gameData) {
    return await database.models.Game.create(gameData)
  }

  async update(id, gameData) {
    const [updatedRows] = await database.models.Game.update(gameData, {
      where: { id }
    })
    return updatedRows > 0
  }

  async delete(id) {
    const deletedRows = await database.models.Game.destroy({
      where: { id }
    })
    return deletedRows > 0
  }

  async findGamesByCreator(creatorId) {
    return await database.models.Game.findAll({
      where: { creatorId }
    })
  }

  async findGamesByStatus(status) {
    return await database.models.Game.findAll({
      where: { status }
    })
  }

  async getPlayerCount(gameId) {
    return await database.models.GamePlayer.count({
      where: { gameId }
    })
  }

  async getGamePlayers(gameId) {
    return await database.models.GamePlayer.findAll({
      where: { gameId },
      include: [{
        model: database.models.User,
        attributes: ['id', 'username']
      }],
      order: [['position', 'ASC']]
    })
  }

  async addPlayerToGame(userId, gameId, position) {
    return await database.models.GamePlayer.create({
      userId,
      gameId,
      position
    })
  }

  async removePlayerFromGame(userId, gameId) {
    const deletedRows = await database.models.GamePlayer.destroy({
      where: { userId, gameId }
    })
    return deletedRows > 0
  }

  async findPlayerInGame(userId, gameId) {
    return await database.models.GamePlayer.findOne({
      where: { userId, gameId }
    })
  }

  async updatePlayerReady(userId, gameId, isReady) {
    const [updatedRows] = await database.models.GamePlayer.update(
      { isReady },
      { where: { userId, gameId } }
    )
    return updatedRows > 0
  }
}

module.exports = new GameRepository()
