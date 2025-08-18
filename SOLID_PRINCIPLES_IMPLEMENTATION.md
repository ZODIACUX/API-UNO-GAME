# SOLID Principles Implementation

This document explains how each SOLID principle has been implemented in the UNO Game API project, with specific examples and code references.

## Overview

The SOLID principles are five design principles that make software designs more understandable, flexible, and maintainable:

- **S**ingle Responsibility Principle (SRP)
- **O**pen/Closed Principle (OCP)
- **L**iskov Substitution Principle (LSP)
- **I**nterface Segregation Principle (ISP)
- **D**ependency Inversion Principle (DIP)

## 1. Single Responsibility Principle (SRP)

**Principle**: A class should have only one reason to change, meaning it should have only one job or responsibility.

### Implementation

#### Before (Violation)
The original [`UnoController.js`](src/controllers/UnoController.js) violated SRP by handling:
- User authentication logic
- Password hashing and validation
- JWT token generation
- Game management
- Database operations
- HTTP request/response handling

#### After (Compliant)
We separated responsibilities into focused classes:

**1. UserAuthenticationService** ([`src/core/services/UserAuthenticationService.js`](src/core/services/UserAuthenticationService.js))
- **Single Responsibility**: Handle user authentication operations only
- Methods: `hashPassword()`, `comparePassword()`, `generateToken()`, `verifyToken()`, `authenticateUser()`

```javascript
class UserAuthenticationService extends BaseService {
  // Only handles authentication-related operations
  async authenticateUser(username, password) {
    // Authentication logic only
  }
  
  async generateToken(userId, username) {
    // Token generation only
  }
}
```

**2. GameManagementService** ([`src/core/services/GameManagementService.js`](src/core/services/GameManagementService.js))
- **Single Responsibility**: Handle game lifecycle management only
- Methods: `createGame()`, `joinGame()`, `startGame()`, `endGame()`

**3. RefactoredAuthController** ([`src/controllers/RefactoredAuthController.js`](src/controllers/RefactoredAuthController.js))
- **Single Responsibility**: Handle HTTP request/response logic only
- Delegates business logic to appropriate services

### Benefits Achieved
- Each class has a single, well-defined purpose
- Changes to authentication logic don't affect game management
- Easier to test individual components
- Better code organization and maintainability

## 2. Open/Closed Principle (OCP)

**Principle**: Software entities should be open for extension but closed for modification.

### Implementation

#### Plugin System Enhancement
We enhanced the existing plugin system to allow extending game functionality without modifying core code:

**1. GameRulePlugin Base Class** ([`src/core/plugins/GameRulePlugin.js`](src/core/plugins/GameRulePlugin.js))
```javascript
class GameRulePlugin extends IPlugin {
  // Base implementation that can be extended
  validateMove(gameState, move, player) {
    return { valid: true, message: 'Move is valid' }
  }
  
  processMove(gameState, move, player) {
    return gameState
  }
}
```

**2. StandardUnoRulePlugin** ([`src/core/plugins/StandardUnoRulePlugin.js`](src/core/plugins/StandardUnoRulePlugin.js))
```javascript
class StandardUnoRulePlugin extends GameRulePlugin {
  // Extends base plugin without modifying it
  validateMove(gameState, move, player) {
    // Custom UNO rule validation
    if (!this.canPlayCard(card, topCard)) {
      return { valid: false, message: 'Card cannot be played' }
    }
    return { valid: true, message: 'Valid move' }
  }
}
```

### Extension Example
To add new game rules (e.g., "House Rules"), create a new plugin:

```javascript
class HouseRulesPlugin extends GameRulePlugin {
  validateMove(gameState, move, player) {
    // Custom house rules without modifying existing code
  }
}
```

### Benefits Achieved
- New game rules can be added without changing existing code
- Plugin system allows runtime rule configuration
- Core game engine remains stable while being extensible

## 3. Liskov Substitution Principle (LSP)

**Principle**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.

### Implementation

#### Repository Hierarchy
Our repository classes follow LSP by ensuring derived classes can substitute base classes:

**1. Base Repository** ([`src/core/repositories/BaseRepository.js`](src/core/repositories/BaseRepository.js))
```javascript
class BaseRepository extends IRepository {
  async findById(id) {
    return Result.fromAsync(async () => {
      // Base implementation
    })
  }
}
```

**2. User Repository** ([`src/repositories/userRepository.js`](src/repositories/userRepository.js))
```javascript
class UserRepository extends BaseRepository {
  // Maintains same contract as base class
  async findById(id) {
    // Can be used anywhere BaseRepository is expected
    return Result.fromAsync(async () => {
      // User-specific implementation
    })
  }
}
```

#### Service Hierarchy
**1. Base Service** ([`src/core/services/BaseService.js`](src/core/services/BaseService.js))
```javascript
class BaseService extends IService {
  async getById(id) {
    // Returns Result monad consistently
    return this.repository.findById(id)
  }
}
```

**2. User Service** ([`src/core/services/UserService.js`](src/core/services/UserService.js))
```javascript
class UserService extends BaseService {
  async getById(id) {
    // Maintains same return type and behavior
    const result = await super.getById(id)
    return result.mapError(error => new Error(`User not found: ${error.message}`))
  }
}
```

### LSP Compliance Verification
- All derived repositories return `Result` monads consistently
- Method signatures remain compatible
- Preconditions are not strengthened in subclasses
- Postconditions are not weakened in subclasses

### Benefits Achieved
- Services can work with any repository implementation
- Polymorphic behavior works correctly
- Easy to swap implementations for testing

## 4. Interface Segregation Principle (ISP)

**Principle**: No client should be forced to depend on methods it does not use.

### Implementation

#### Before (Violation)
The original [`IRepository.js`](src/core/interfaces/IRepository.js) was too broad:
```javascript
class IRepository {
  async findById(id) { /* ... */ }
  async findAll() { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
  // All clients forced to implement all methods
}
```

#### After (Compliant)
We created focused, segregated interfaces:

**1. Read-Only Operations** ([`src/core/interfaces/IReadRepository.js`](src/core/interfaces/IReadRepository.js))
```javascript
class IReadRepository {
  async findById(id) { /* ... */ }
  async findAll() { /* ... */ }
  async findBy(criteria) { /* ... */ }
  async exists(id) { /* ... */ }
  async count() { /* ... */ }
}
```

**2. Write Operations** ([`src/core/interfaces/IWriteRepository.js`](src/core/interfaces/IWriteRepository.js))
```javascript
class IWriteRepository {
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
  async bulkCreate(dataArray) { /* ... */ }
}
```

**3. Domain-Specific Interfaces**

**User Repository Interface** ([`src/core/interfaces/IUserRepository.js`](src/core/interfaces/IUserRepository.js))
```javascript
class IUserRepository {
  async findByUsername(username) { /* ... */ }
  async findByEmail(email) { /* ... */ }
  async findByUsernameOrEmail(username, email) { /* ... */ }
  async findActiveUsers() { /* ... */ }
}
```

**Game Repository Interface** ([`src/core/interfaces/IGameRepository.js`](src/core/interfaces/IGameRepository.js))
```javascript
class IGameRepository {
  async findByCreatorId(creatorId) { /* ... */ }
  async findByStatus(status) { /* ... */ }
  async findActiveGames() { /* ... */ }
  async updateGameStatus(gameId, status) { /* ... */ }
}
```

### Benefits Achieved
- Read-only services only implement read interfaces
- Clients depend only on methods they actually use
- More focused and cohesive interfaces
- Easier to implement and test

## 5. Dependency Inversion Principle (DIP)

**Principle**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

### Implementation

#### Before (Violation)
Controllers directly instantiated repositories:
```javascript
class UnoController {
  registerUser = async (req, res) => {
    const userRepository = AppDataSource.getRepository(User) // Direct dependency
    // ...
  }
}
```

#### After (Compliant)
We implemented dependency injection:

**1. Service Registration** ([`src/core/di/ServiceRegistration.js`](src/core/di/ServiceRegistration.js))
```javascript
class ServiceRegistration {
  static registerServices(container) {
    // Register abstractions, not concrete implementations
    container.registerSingleton('userRepository', () => new UserRepository())
    container.registerSingleton('userAuthService', (userRepo) => 
      new UserAuthenticationService(userRepo, JWT_SECRET)
    )
  }
}
```

**2. Controller Dependency Injection** ([`src/controllers/RefactoredAuthController.js`](src/controllers/RefactoredAuthController.js))
```javascript
class RefactoredAuthController extends BaseController {
  constructor(userAuthService, userService) {
    super()
    // Depends on abstractions, not concrete classes
    this.userAuthService = userAuthService
    this.userService = userService
  }
}
```

**3. Service Dependencies**
```javascript
class UserAuthenticationService extends BaseService {
  constructor(userRepository, jwtSecret) {
    super(userRepository) // Depends on IUserRepository interface
    this.jwtSecret = jwtSecret
  }
}
```

### Dependency Flow
```
High Level: Controllers
     ↓ (depends on)
Medium Level: Services  
     ↓ (depends on)
Low Level: Repositories
     ↓ (depends on)
Abstractions: Interfaces
```

### Benefits Achieved
- Controllers don't know about specific repository implementations
- Easy to swap implementations for testing
- Loose coupling between layers
- Inversion of control achieved

## 6. Enhanced Error Handling with Monads

### Implementation

We implemented functional error handling using Monads as requested:

**1. Maybe Monad** ([`src/core/errors/Maybe.js`](src/core/errors/Maybe.js))
```javascript
class Maybe {
  static fromNullable(value) {
    return value == null ? Maybe.none() : Maybe.some(value)
  }
  
  map(fn) {
    return this.isNone() ? Maybe.none() : Maybe.of(fn(this.value))
  }
  
  flatMap(fn) {
    return this.isNone() ? Maybe.none() : fn(this.value)
  }
}
```

**2. Either Monad** ([`src/core/errors/Either.js`](src/core/errors/Either.js))
```javascript
class Either {
  static tryCatchAsync(fn, errorHandler) {
    try {
      const result = await fn()
      return Either.right(result)
    } catch (error) {
      return Either.left(errorHandler(error))
    }
  }
  
  fold(leftFn, rightFn) {
    return this.isLeft ? leftFn(this.value) : rightFn(this.value)
  }
}
```

**3. Usage in Controllers**
```javascript
const loginResult = await Either.tryCatchAsync(async () => {
  const authResult = await this.userAuthService.authenticateUser(username, password)
  // ... authentication logic
  return { token: tokenResult.value }
})

return loginResult.fold(
  (error) => Result.failure(new Error('Invalid credentials')),
  (data) => Result.success({ access_token: data.token })
)
```

## 7. Clean Code Principles Applied

### Naming Conventions
- **Classes**: PascalCase with descriptive names (`UserAuthenticationService`)
- **Methods**: camelCase with verb-noun pattern (`authenticateUser`, `generateToken`)
- **Variables**: camelCase with meaningful names (`hashedPassword`, `tokenResult`)

### Modularization
- **Single Purpose Modules**: Each file has one primary export
- **Logical Grouping**: Related functionality grouped in directories
- **Clear Dependencies**: Explicit imports and exports

### Code Readability
- **Consistent Formatting**: 2-space indentation, consistent spacing
- **Meaningful Comments**: JSDoc comments for classes and complex methods
- **Error Messages**: Descriptive, user-friendly error messages

## 8. Testing Strategy

### Unit Test Coverage
We implemented comprehensive unit tests to achieve >70% coverage:

**1. Service Tests** ([`tests/unit/core/services/UserAuthenticationService.test.js`](tests/unit/core/services/UserAuthenticationService.test.js))
- Tests all authentication methods
- Mocks dependencies properly
- Tests both success and failure scenarios

**2. Monad Tests** ([`tests/unit/core/errors/Maybe.test.js`](tests/unit/core/errors/Maybe.test.js))
- Tests all Maybe monad operations
- Verifies functional programming patterns
- Tests edge cases and error conditions

### Test Structure
```javascript
describe('UserAuthenticationService', () => {
  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'test', isActive: true }
      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(Result.success(mockUser))
      
      // Act
      const result = await userAuthService.authenticateUser('test', 'password')
      
      // Assert
      expect(result.isSuccess).toBe(true)
    })
  })
})
```

## Summary

This implementation demonstrates all five SOLID principles working together:

1. **SRP**: Each class has a single, well-defined responsibility
2. **OCP**: Plugin system allows extension without modification
3. **LSP**: Derived classes can substitute base classes seamlessly
4. **ISP**: Interfaces are focused and client-specific
5. **DIP**: High-level modules depend on abstractions, not concretions

The refactored codebase is more maintainable, testable, and extensible while following clean code principles and achieving comprehensive test coverage.

## Code Examples Summary

| Principle | Before | After | File Reference |
|-----------|--------|-------|----------------|
| SRP | Monolithic `UnoController` | Separate `UserAuthenticationService`, `GameManagementService` | [`src/core/services/`](src/core/services/) |
| OCP | Hard-coded game rules | Plugin-based rule system | [`src/core/plugins/GameRulePlugin.js`](src/core/plugins/GameRulePlugin.js) |
| LSP | Inconsistent interfaces | Substitutable repository hierarchy | [`src/core/repositories/BaseRepository.js`](src/core/repositories/BaseRepository.js) |
| ISP | Monolithic `IRepository` | Segregated interfaces (`IReadRepository`, `IUserRepository`) | [`src/core/interfaces/`](src/core/interfaces/) |
| DIP | Direct dependencies | Dependency injection with abstractions | [`src/controllers/RefactoredAuthController.js`](src/controllers/RefactoredAuthController.js) |

This implementation provides a solid foundation for future development while maintaining high code quality and adherence to software engineering best practices.