// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_EXPIRES_IN = '24h'

// Mock the database connection
jest.mock('../src/database/data-source', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }),
    query: jest.fn()
  }
}))

// Global test setup
beforeEach(() => {
  jest.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
