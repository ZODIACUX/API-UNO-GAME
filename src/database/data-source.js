const { DataSource } = require('typeorm')
require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3319,
  username: process.env.DB_USERNAME || 'gameuser',
  password: process.env.DB_PASSWORD || 'gamepassword',
  database: process.env.DB_NAME || (env === 'test' ? 'game_management_test' : 'game_management'),
  synchronize: env !== 'production',
  logging: process.env.LOG_LEVEL === 'debug',
  entities: [
    require('../entities/User').User,
    require('../entities/UnoGame').UnoGame,
    require('../entities/GameParticipant').GameParticipant,
    require('../entities/GamePlayer').GamePlayer,
    require('../entities/GameScore').GameScore,
    require('../entities/Card').Card,
    require('../entities/GameCard').GameCard
  ],
  migrations: ['src/migrations/*.js'],
  subscribers: ['src/subscribers/*.js']
})

module.exports = { AppDataSource }
