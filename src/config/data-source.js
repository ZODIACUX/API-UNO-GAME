const { DataSource } = require('typeorm')

const { User } = require('../models/User')
const { Card } = require('../models/Card')
const { GameCard } = require('../models/GameCard')
const { GamePlayer } = require('../models/GamePlayer')
const { GameScore } = require('../models/GameScore')
const { UnoGame } = require('../models/UnoGame')
const { GameParticipant } = require('../models/GameParticipant')

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3319,
  username: process.env.DB_USER || 'gameuser',
  password: process.env.DB_PASSWORD || '',
  database: process.env.NODE_ENV === 'test'
    ? (process.env.DB_NAME_TEST || 'uno_game_test')
    : (process.env.DB_NAME || 'game_management'),
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Card, GameCard, GamePlayer, GameScore, UnoGame, GameParticipant],
  migrations: ['src/migrations/*.js'],
})

module.exports = { AppDataSource }
