const request = require('supertest')
const app = require('../../src/app')

// Mock the service registration
jest.mock('../../src/core/di/ServiceRegistration', () => ({
  register: jest.fn()
}))

// Mock the database connection
jest.mock('../../src/database/data-source', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: false
  }
}))

describe('App', () => {
  describe('Health endpoint', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('timestamp')
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })
  })

  describe('Middleware', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@example.com', password: 'password' })
        .set('Content-Type', 'application/json')

      // Should not return 400 for malformed JSON since middleware handles it
      expect(response.status).not.toBe(400)
    })

    it('should handle CORS', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
    })

    it('should apply rate limiting headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.headers).toHaveProperty('x-ratelimit-limit')
      expect(response.headers).toHaveProperty('x-ratelimit-remaining')
    })
  })

  describe('Error handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message')
    })

    it('should handle 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message')
    })
  })

  describe('Security middleware', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      // Helmet sets various security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff')
      expect(response.headers).toHaveProperty('x-frame-options')
    })
  })

  describe('Request parsing', () => {
    it('should parse URL encoded data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send('username=test&email=test@example.com&password=password')
        .set('Content-Type', 'application/x-www-form-urlencoded')

      // Should not return 400 for parsing issues
      expect(response.status).not.toBe(400)
    })

    it('should handle large JSON payloads within limit', async () => {
      const largeData = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
        data: 'x'.repeat(1000) // Small payload within 10mb limit
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(largeData)
        .set('Content-Type', 'application/json')

      // Should not return 413 for payload size
      expect(response.status).not.toBe(413)
    })
  })
})
