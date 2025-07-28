require('dotenv').config();

const databaseConfig = {
  development: {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
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
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // NUNCA en producción
    logging: false,
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
    subscribers: ["dist/subscribers/*.js"],
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  },
  
  test: {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME + "_test" || "game_management_test",
    synchronize: true,
    logging: false,
    entities: ["src/entities/*.js"],
    dropSchema: true, // Limpia la BD en cada test
  }
};

module.exports = databaseConfig;
