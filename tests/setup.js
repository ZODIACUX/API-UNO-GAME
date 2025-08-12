const { AppDataSource } = require('../src/database/data-source')

// Setup test database connection
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
})

// Clean up after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
})

// Clean up after each test
afterEach(async () => {
  if (AppDataSource.isInitialized) {
    try {
      // Disable foreign key checks temporarily
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')

      // Clear tables in reverse dependency order to avoid foreign key constraint errors
      const tableOrder = [
        'game_cards',
        'game_scores',
        'game_players',
        'games',
        'cards',
        'users'
      ]

      for (const tableName of tableOrder) {
        try {
          await AppDataSource.query(`DELETE FROM ${tableName}`)
          // Reset auto-increment counter
          await AppDataSource.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`)
        } catch (error) {
          // Table might not exist, continue with next table
          console.warn(`Warning: Could not clear table ${tableName}:`, error.message)
        }
      }

      // Re-enable foreign key checks
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
    } catch (error) {
      console.error('Error during test cleanup:', error)
      // Re-enable foreign key checks even if cleanup failed
      try {
        await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
      } catch (fkError) {
        console.error('Error re-enabling foreign key checks:', fkError)
      }
    }
  }
})
