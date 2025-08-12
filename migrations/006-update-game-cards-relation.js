module.exports = class UpdateGameCardsRelation1691760000000 {
  name = 'UpdateGameCardsRelation1691760000000'

  async up(queryRunner) {
    // Primero eliminamos la columna userId existente
    await queryRunner.query('ALTER TABLE `game_cards` DROP FOREIGN KEY `FK_game_cards_users`')
    await queryRunner.query('ALTER TABLE `game_cards` DROP COLUMN `userId`')
    // Luego agregamos la nueva columna playerId
    await queryRunner.query('ALTER TABLE `game_cards` ADD `playerId` int NULL')
    await queryRunner.query('ALTER TABLE `game_cards` ADD CONSTRAINT `FK_game_cards_game_players` FOREIGN KEY (`playerId`) REFERENCES `game_players`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION')
  }

  async down(queryRunner) {
    // Revertimos los cambios
    await queryRunner.query('ALTER TABLE `game_cards` DROP FOREIGN KEY `FK_game_cards_game_players`')
    await queryRunner.query('ALTER TABLE `game_cards` DROP COLUMN `playerId`')
    await queryRunner.query('ALTER TABLE `game_cards` ADD `userId` int NULL')
    await queryRunner.query('ALTER TABLE `game_cards` ADD CONSTRAINT `FK_game_cards_users` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION')
  }
}
