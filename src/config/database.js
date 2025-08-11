require('dotenv').config();

module.exports = {
  development: {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3319,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "rootpasword",
    database: process.env.DB_NAME || "game_management",
    synchronize: true, // Solo para desarrollo
    logging: process.env.LOG_LEVEL === 'debug',
    entities: ["src/entities/*.js"],
    migrations: ["src/migrations/*.js"],
    subscribers: ["src/subscribers/*.js"],
  },
  production: {
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3319,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
};
