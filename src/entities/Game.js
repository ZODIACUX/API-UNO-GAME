const { EntitySchema } = require("typeorm");

const Game = new EntitySchema({
  name: "Game",
  tableName: "games",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      generated: "uuid"
    },
    name: {
      type: "varchar",
      length: 100
    },
    description: {
      type: "text"
    },
    category: {
      type: "varchar",
      length: 50
    },
    minPlayers: {
      type: "int",
      default: 1
    },
    maxPlayers: {
      type: "int",
      default: 10
    },
    difficulty: {
      type: "int",
      default: 0
    },
    isActive: {
      type: "boolean",
      default: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    scores: {
      type: "one-to-many",
      target: "Score",
      inverseSide: "game"
    }
  }
});

module.exports = { Game };