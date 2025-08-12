const { Table, TableIndex } = require('typeorm')

module.exports = class CreateCards1691760000001 {
  name = 'CreateCards1691760000001'

  async up(queryRunner) {
    // Primero creamos los tipos ENUM
    await queryRunner.query('CREATE TYPE card_color AS ENUM (\'red\', \'blue\', \'green\', \'yellow\', \'wild\')')
    await queryRunner.query('CREATE TYPE card_type AS ENUM (\'number\', \'skip\', \'reverse\', \'draw_two\', \'wild\', \'wild_draw_four\')')

    await queryRunner.createTable(
      new Table({
        name: 'cards',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'color',
            type: 'card_color',
            isNullable: false
          },
          {
            name: 'type',
            type: 'card_type',
            isNullable: false
          },
          {
            name: 'value',
            type: 'varchar',
            length: '20',
            isNullable: true
          }
        ]
      }),
      true
    )

    // Crear índices
    await queryRunner.createIndex(
      'cards',
      new TableIndex({
        name: 'IDX_CARD_COLOR',
        columnNames: ['color']
      })
    )

    await queryRunner.createIndex(
      'cards',
      new TableIndex({
        name: 'IDX_CARD_TYPE',
        columnNames: ['type']
      })
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('cards')
    await queryRunner.query('DROP TYPE card_color')
    await queryRunner.query('DROP TYPE card_type')
  }
}
