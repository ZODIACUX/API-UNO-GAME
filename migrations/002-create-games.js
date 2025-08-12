const { Table, TableIndex, TableForeignKey } = require('typeorm')

module.exports = class CreateGames1691760000001 {
  name = 'CreateGames1691760000001'

  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'rules',
            type: 'text',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['waiting', 'in_progress', 'finished'],
            default: '\'waiting\''
          },
          {
            name: 'currentPlayerId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'direction',
            type: 'enum',
            enum: ['clockwise', 'counterclockwise'],
            default: '\'clockwise\''
          },
          {
            name: 'topCard',
            type: 'json',
            isNullable: true
          },
          {
            name: 'creatorId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'maxPlayers',
            type: 'int',
            default: 4
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
      'games',
      new TableForeignKey({
        columnNames: ['currentPlayerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL'
      })
    )

    await queryRunner.createForeignKey(
      'games',
      new TableForeignKey({
        columnNames: ['creatorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    )

    // Create indexes
    await queryRunner.createIndex(
      'games',
      new TableIndex({
        name: 'IDX_GAMES_CREATOR',
        columnNames: ['creatorId']
      })
    )

    await queryRunner.createIndex(
      'games',
      new TableIndex({
        name: 'IDX_GAMES_STATUS',
        columnNames: ['status']
      })
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('games')
  }
}
