require('dotenv').config()

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3319,
  username: process.env.DB_USERNAME || 'gameuser',
  password: process.env.DB_PASSWORD || 'gamepassword',
  database: process.env.DB_NAME || (process.env.NODE_ENV === 'test' ? 'game_management_test' : 'game_management'),
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.LOG_LEVEL === 'debug',
  entities: ['src/entities/**/*.js'],
  migrations: ['src/migrations/**/*.js'],
  subscribers: ['src/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers'
  }
}
