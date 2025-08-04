const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
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
      length: 150,
      unique: true
    },
    password: {
      type: "varchar",
      length: 255
    },
    isActive: {
      type: "boolean",
      default: true
    },
    lastLogin: {
      type: "timestamp",
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

module.exports = { User };