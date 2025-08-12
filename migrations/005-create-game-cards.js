const { Table, TableIndex, TableForeignKey } = require('typeorm')

module.exports = class CreateGameCards1691760000003 {
  name = 'CreateGameCards1691760000003'

  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'game_cards',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'gameId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'cardId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'location',
            type: 'enum',
            enum: ['hand', 'deck', 'discard'],
            default: '\'deck\''
          },
          {
            name: 'position',
            type: 'int',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    )

    // Create foreign keys
    await queryRunner.createForeignKey(
      'game_cards',
      new TableForeignKey({
        columnNames: ['gameId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        onDelete: 'CASCADE'
      })
    )

    await queryRunner.createForeignKey(
      'game_cards',
      new TableForeignKey({
        columnNames: ['cardId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cards'
      })
    )

    await queryRunner.createForeignKey(
      'game_cards',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL'
      })
    )

    // Create indexes
    await queryRunner.createIndex(
      'game_cards',
      new TableIndex({
        name: 'IDX_GAME_CARDS_GAME',
        columnNames: ['gameId']
      })
    )

    await queryRunner.createIndex(
      'game_cards',
      new TableIndex({
        name: 'IDX_GAME_CARDS_USER',
        columnNames: ['userId']
      })
    )

    await queryRunner.createIndex(
      'game_cards',
      new TableIndex({
        name: 'IDX_GAME_CARDS_LOCATION',
        columnNames: ['location']
      })
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('game_cards')
  }
}
