const { Table, TableIndex } = require('typeorm')

module.exports = class CreateUsers1691760000000 {
  name = 'CreateUsers1691760000000'

  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true
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

    // Crear índices
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERNAME',
        columnNames: ['username']
      })
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_EMAIL',
        columnNames: ['email']
      })
    )
  }

  async down(queryRunner) {
    await queryRunner.dropTable('users')
  }
}
