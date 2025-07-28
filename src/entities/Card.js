const { EntitySchema } = require("typeorm");

const Card = new EntitySchema({
  name: "Card",
  tableName: "cards",
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
    type: {
      type: "varchar",
      length: 50
    },
    value: {
      type: "int",
      default: 0
    },
    rarity: {
      type: "varchar",
      length: 50
    },
    isActive: {
      type: "boolean",
      default: true
    },
    attributes: {
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

module.exports = { Card };