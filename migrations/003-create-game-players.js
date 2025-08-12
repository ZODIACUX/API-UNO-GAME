const { Table, TableIndex, TableForeignKey } = require('typeorm')

module.exports = class CreateGamePlayers1691760000002 {
  name = 'CreateGamePlayers1691760000002'

  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'game_players',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'gameId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'score',
            type: 'int',
            default: 0
          },
          {
            name: 'position',
            type: 'int',
            isNullable: false
          },
          {
            name: 'isReady',
            type: 'boolean',
            default: false
          },
          {
            name: 'cardsCount',
            type: 'int',
            default: 7
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
      'game_players',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    )

    await queryRunner.createForeignKey(
      'game_players',
      new TableForeignKey({
        columnNames: ['gameId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        onDelete: 'CASCADE'
      })
    )

    // Create indexes
    await queryRunner.createIndex(
      'game_players',
      new TableIndex({
        name: 'IDX_GAME_PLAYERS_USER',
        columnNames: ['userId']
      })
    )

    await queryRunner.createIndex(
      'game_players',
      new TableIndex({
        name: 'IDX_GAME_PLAYERS_GAME',
        columnNames: ['gameId']
      })
    )

    await queryRunner.createIndex(
      'game_players',
      new TableIndex({
        name: 'unique_user_game',
        columnNames: ['userId', 'gameId'],
        isUnique: true
      })
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('game_players')
  }
}
