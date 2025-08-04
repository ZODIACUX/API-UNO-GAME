const { EntitySchema } = require("typeorm");

const UnoGame = new EntitySchema({
  name: "UnoGame",
  tableName: "uno_games",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar",
      length: 100
    },
    rules: {
      type: "text",
      nullable: true
    },
    creatorId: {
      type: "varchar"
    },
    status: {
      type: "varchar",
      length: 20,
      default: "waiting"
    },
    currentPlayer: {
      type: "varchar",
      nullable: true
    },
    topCard: {
      type: "varchar",
      nullable: true,
      default: "Red 1"
    },
    gameData: {
      type: "json",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  }
});

module.exports = { UnoGame };