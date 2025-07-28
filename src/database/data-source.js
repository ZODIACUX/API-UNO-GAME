require('dotenv').config();
const { DataSource } = require("typeorm");
const { Player } = require("../entities/Player");
const { Game } = require("../entities/Game");
const { Card } = require("../entities/Card");
const { Score } = require("../entities/Score");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "game_management",
  synchronize: true, // Solo para desarrollo
  logging: false,
  entities: [Player, Game, Card, Score],
  migrations: [],
  subscribers: [],
});

module.exports = { AppDataSource };