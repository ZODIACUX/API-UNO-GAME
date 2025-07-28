const { EntitySchema } = require("typeorm");

const Score = new EntitySchema({
  name: "Score",
  tableName: "scores",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      generated: "uuid"
    },
    playerId: {
      type: "varchar"
    },
    gameId: {
      type: "varchar"
    },
    score: {
      type: "int",
      default: 0
    },
    level: {
      type: "int",
      default: 0
    },
    gameDate: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    gameData: {
      type: "json",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    player: {
      type: "many-to-one",
      target: "Player",
      joinColumn: {
        name: "playerId"
      },
      inverseSide: "scores"
    },
    game: {
      type: "many-to-one",
      target: "Game",
      joinColumn: {
        name: "gameId"
      },
      inverseSide: "scores"
    }
  }
});

module.exports = { Score };
