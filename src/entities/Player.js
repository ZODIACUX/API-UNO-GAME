const { EntitySchema } = require("typeorm");

const Player = new EntitySchema({
  name: "Player",
  tableName: "players",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      generated: "uuid"
    },
    username: {
      type: "varchar",
      length: 100,
      unique: true
    },
    email: {
      type: "varchar",
      length: 150
    },
    firstName: {
      type: "varchar",
      length: 100
    },
    lastName: {
      type: "varchar",
      length: 100
    },
    totalScore: {
      type: "int",
      default: 0
    },
    gamesPlayed: {
      type: "int",
      default: 0
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
      inverseSide: "player"
    }
  }
});

module.exports = { Player };