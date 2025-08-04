const { EntitySchema } = require("typeorm");

const GameParticipant = new EntitySchema({
  name: "GameParticipant",
  tableName: "game_participants",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      generated: "uuid"
    },
    gameId: {
      type: "int"
    },
    userId: {
      type: "varchar"
    },
    username: {
      type: "varchar",
      length: 100
    },
    score: {
      type: "int",
      default: 0
    },
    isReady: {
      type: "boolean",
      default: false
    },
    joinedAt: {
      type: "timestamp",
      createDate: true
    }
  }
});

module.exports = { GameParticipant };