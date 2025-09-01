const PluginManager = require('../../../../src/core/plugins/PluginManager')
const IPlugin = require('../../../../src/core/plugins/IPlugin')

class MockPlugin extends IPlugin {
  constructor(name = 'mockPlugin') {
    super()
    this.pluginName = name
    this.initialized = false
    this.executed = false
    this.shutDown = false
  }

  getName() {
    return this.pluginName
  }

  getVersion() {
    return '1.0.0'
  }

  initialize() {
    this.initialized = true
  }

  execute(context) {
    this.executed = true
    return { result: 'executed', context }
  }

  shutdown() {
    this.shutDown = true
  }
}

describe('PluginManager', () => {
  let pluginManager

  beforeEach(() => {
    pluginManager = new PluginManager()
  })

  describe('registerPlugin', () => {
    it('should register a valid plugin', () => {
      const plugin = new MockPlugin('testPlugin')

      const result = pluginManager.registerPlugin(plugin)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(plugin)
      expect(plugin.initialized).toBe(true)
      expect(pluginManager.getRegisteredPlugins()).toContain('testPlugin')
    })

    it('should fail to register invalid plugin', () => {
      const invalidPlugin = {}

      const result = pluginManager.registerPlugin(invalidPlugin)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Invalid plugin: must implement getName method')
    })

    it('should fail to register plugin with duplicate name', () => {
      const plugin1 = new MockPlugin('duplicateName')
      const plugin2 = new MockPlugin('duplicateName')

      pluginManager.registerPlugin(plugin1)
      const result = pluginManager.registerPlugin(plugin2)

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Plugin duplicateName is already registered')
    })
  })

  describe('unregisterPlugin', () => {
    it('should unregister an existing plugin', () => {
      const plugin = new MockPlugin('testPlugin')
      pluginManager.registerPlugin(plugin)

      const result = pluginManager.unregisterPlugin('testPlugin')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(true)
      expect(plugin.shutDown).toBe(true)
      expect(pluginManager.getRegisteredPlugins()).not.toContain('testPlugin')
    })

    it('should fail to unregister non-existing plugin', () => {
      const result = pluginManager.unregisterPlugin('nonExistingPlugin')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Plugin nonExistingPlugin is not registered')
    })
  })

  describe('executePlugin', () => {
    it('should execute a registered plugin', () => {
      const plugin = new MockPlugin('testPlugin')
      pluginManager.registerPlugin(plugin)

      const context = { data: 'test' }
      const result = pluginManager.executePlugin('testPlugin', context)

      expect(result.isSuccess).toBe(true)
      expect(result.value.result).toBe('executed')
      expect(result.value.context).toBe(context)
      expect(plugin.executed).toBe(true)
    })

    it('should fail to execute non-existing plugin', () => {
      const result = pluginManager.executePlugin('nonExistingPlugin')

      expect(result.isSuccess).toBe(false)
      expect(result.error.message).toBe('Plugin nonExistingPlugin is not registered')
    })
  })

  describe('registerHook and executeHook', () => {
    it('should register and execute hooks', async () => {
      const hook1 = jest.fn(data => ({ ...data, hook1: true }))
      const hook2 = jest.fn(data => ({ ...data, hook2: true }))

      pluginManager.registerHook('testEvent', hook1)
      pluginManager.registerHook('testEvent', hook2)

      const initialData = { value: 'test' }
      const result = await pluginManager.executeHook('testEvent', initialData)

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('test')
      expect(result.value.hook1).toBe(true)
      expect(result.value.hook2).toBe(true)
      expect(hook1).toHaveBeenCalledWith(initialData)
      expect(hook2).toHaveBeenCalled()
    })

    it('should return original data when no hooks registered', async () => {
      const initialData = { value: 'test' }
      const result = await pluginManager.executeHook('nonExistingEvent', initialData)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(initialData)
    })

    it('should handle async hooks', async () => {
      const asyncHook = jest.fn(async data => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { ...data, async: true }
      })

      pluginManager.registerHook('asyncEvent', asyncHook)

      const initialData = { value: 'test' }
      const result = await pluginManager.executeHook('asyncEvent', initialData)

      expect(result.isSuccess).toBe(true)
      expect(result.value.async).toBe(true)
      expect(asyncHook).toHaveBeenCalledWith(initialData)
    })
  })

  describe('getPlugin', () => {
    it('should return registered plugin', () => {
      const plugin = new MockPlugin('testPlugin')
      pluginManager.registerPlugin(plugin)

      const retrieved = pluginManager.getPlugin('testPlugin')

      expect(retrieved).toBe(plugin)
    })

    it('should return undefined for non-existing plugin', () => {
      const retrieved = pluginManager.getPlugin('nonExistingPlugin')

      expect(retrieved).toBeUndefined()
    })
  })
})
