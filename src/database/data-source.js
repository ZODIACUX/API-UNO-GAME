const { DataSource } = require('typeorm')

const { User } = require('../entities/User')
const { Card } = require('../entities/Card')
const { GameCard } = require('../entities/GameCard')
const { GamePlayer } = require('../entities/GamePlayer')
const { GameScore } = require('../entities/GameScore')
const { UnoGame } = require('../entities/UnoGame')
const { GameParticipant } = require('../entities/GameParticipant')

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
  subscribers: ['src/subscribers/*.js'],
})

module.exports = { AppDataSource }
