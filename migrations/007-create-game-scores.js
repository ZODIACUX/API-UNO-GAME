const { Table, Index } = require('typeorm')

class CreateGameScores1703000007 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'game_scores',
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
            name: 'participantId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'points',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'position',
            type: 'int',
            default: 1,
            isNullable: false
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            columnNames: ['gameId'],
            referencedTableName: 'games',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['participantId'],
            referencedTableName: 'game_players',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          new Index('IDX_game_scores_gameId', ['gameId']),
          new Index('IDX_game_scores_participantId', ['participantId']),
          new Index('IDX_game_scores_points', ['points']),
          new Index('IDX_game_scores_game_participant', ['gameId', 'participantId'], { isUnique: true })
        ]
      }),
      true
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('game_scores')
  }
}

module.exports = { CreateGameScores1703000007 }
