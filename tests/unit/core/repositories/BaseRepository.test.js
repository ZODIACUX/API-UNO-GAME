const BaseRepository = require('../../../../src/core/repositories/BaseRepository')

// Mock entity for testing
class MockEntity {
  constructor(data) {
    Object.assign(this, data)
  }
}

describe('BaseRepository', () => {
  let repository
  let mockDataSource
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }

    mockDataSource = {
      isInitialized: true,
      initialize: jest.fn(),
      getRepository: jest.fn().mockReturnValue(mockRepository)
    }

    repository = new BaseRepository(MockEntity, mockDataSource)
  })

  describe('constructor', () => {
    it('should initialize with entity and dataSource', () => {
      expect(repository.entity).toBe(MockEntity)
      expect(repository.dataSource).toBe(mockDataSource)
      expect(repository.repository).toBe(null)
    })
  })

  describe('getRepository', () => {
    it('should return cached repository if already initialized', async () => {
      repository.repository = mockRepository

      const result = await repository.getRepository()

      expect(result).toBe(mockRepository)
      expect(mockDataSource.getRepository).not.toHaveBeenCalled()
    })

    it('should initialize dataSource if not initialized', async () => {
      mockDataSource.isInitialized = false

      const result = await repository.getRepository()

      expect(mockDataSource.initialize).toHaveBeenCalled()
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(MockEntity)
      expect(result).toBe(mockRepository)
    })

    it('should get repository from dataSource when not cached', async () => {
      const result = await repository.getRepository()

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(MockEntity)
      expect(result).toBe(mockRepository)
      expect(repository.repository).toBe(mockRepository)
    })
  })

  describe('findById', () => {
    it('should find entity by id successfully', async () => {
      const mockEntity = { id: 1, name: 'Test' }
      mockRepository.findOne.mockResolvedValue(mockEntity)

      const result = await repository.findById(1)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(mockEntity)
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should fail when entity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      const result = await repository.findById(999)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Entity with id 999 not found')
    })

    it('should handle database errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'))

      const result = await repository.findById(1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Database error')
    })
  })

  describe('findAll', () => {
    it('should find all entities successfully', async () => {
      const mockEntities = [{ id: 1 }, { id: 2 }]
      mockRepository.find.mockResolvedValue(mockEntities)

      const result = await repository.findAll()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(mockEntities)
      expect(mockRepository.find).toHaveBeenCalledWith({})
    })

    it('should find entities with options', async () => {
      const mockEntities = [{ id: 1 }]
      const options = { where: { active: true } }
      mockRepository.find.mockResolvedValue(mockEntities)

      const result = await repository.findAll(options)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(mockEntities)
      expect(mockRepository.find).toHaveBeenCalledWith(options)
    })

    it('should handle database errors', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'))

      const result = await repository.findAll()

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Database error')
    })
  })

  describe('create', () => {
    it('should create entity successfully', async () => {
      const data = { name: 'Test Entity' }
      const mockEntity = { id: 1, name: 'Test Entity' }
      const savedEntity = { id: 1, name: 'Test Entity' }

      mockRepository.create.mockReturnValue(mockEntity)
      mockRepository.save.mockResolvedValue(savedEntity)

      const result = await repository.create(data)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(savedEntity)
      expect(mockRepository.create).toHaveBeenCalledWith(data)
      expect(mockRepository.save).toHaveBeenCalledWith(mockEntity)
    })

    it('should handle creation errors', async () => {
      const data = { name: 'Test Entity' }
      mockRepository.create.mockImplementation(() => {
        throw new Error('Creation error')
      })

      const result = await repository.create(data)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Creation error')
    })

    it('should handle save errors', async () => {
      const data = { name: 'Test Entity' }
      const mockEntity = { id: 1, name: 'Test Entity' }

      mockRepository.create.mockReturnValue(mockEntity)
      mockRepository.save.mockRejectedValue(new Error('Save error'))

      const result = await repository.create(data)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Save error')
    })
  })

  describe('update', () => {
    it('should update entity successfully', async () => {
      const updateResult = { affected: 1 }
      mockRepository.update.mockResolvedValue(updateResult)

      const result = await repository.update(1, { name: 'Updated' })

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(true)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { name: 'Updated' })
    })

    it('should fail when entity not found for update', async () => {
      const updateResult = { affected: 0 }
      mockRepository.update.mockResolvedValue(updateResult)

      const result = await repository.update(999, { name: 'Updated' })

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Entity with id 999 not found')
    })

    it('should handle update errors', async () => {
      mockRepository.update.mockRejectedValue(new Error('Update error'))

      const result = await repository.update(1, { name: 'Updated' })

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Update error')
    })
  })

  describe('delete', () => {
    it('should delete entity successfully', async () => {
      const deleteResult = { affected: 1 }
      mockRepository.delete.mockResolvedValue(deleteResult)

      const result = await repository.delete(1)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(true)
      expect(mockRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should fail when entity not found for deletion', async () => {
      const deleteResult = { affected: 0 }
      mockRepository.delete.mockResolvedValue(deleteResult)

      const result = await repository.delete(999)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Entity with id 999 not found')
    })

    it('should handle delete errors', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Delete error'))

      const result = await repository.delete(1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Delete error')
    })
  })

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      mockRepository.count.mockResolvedValue(1)

      const result = await repository.exists(1)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(true)
      expect(mockRepository.count).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should return false when entity does not exist', async () => {
      mockRepository.count.mockResolvedValue(0)

      const result = await repository.exists(999)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should handle count errors', async () => {
      mockRepository.count.mockRejectedValue(new Error('Count error'))

      const result = await repository.exists(1)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Count error')
    })
  })

  describe('count', () => {
    it('should count entities successfully', async () => {
      mockRepository.count.mockResolvedValue(5)

      const result = await repository.count()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(5)
      expect(mockRepository.count).toHaveBeenCalledWith({})
    })

    it('should count entities with options', async () => {
      const options = { where: { active: true } }
      mockRepository.count.mockResolvedValue(3)

      const result = await repository.count(options)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(3)
      expect(mockRepository.count).toHaveBeenCalledWith(options)
    })

    it('should handle count errors', async () => {
      mockRepository.count.mockRejectedValue(new Error('Count error'))

      const result = await repository.count()

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Count error')
    })
  })
})
