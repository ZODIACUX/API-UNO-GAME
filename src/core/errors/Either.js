/**
 * Either Monad for handling success/failure scenarios
 * Implements functional error handling patterns
 */
class Either {
  constructor(value, isLeftValue = false) {
    this.value = value
    this._isLeft = isLeftValue
  }

  static left(value) {
    return new Either(value, true)
  }

  static right(value) {
    return new Either(value, false)
  }

  static of(value) {
    return Either.right(value)
  }

  static fromNullable(value, leftValue = 'Value is null or undefined') {
    return value == null ? Either.left(leftValue) : Either.right(value)
  }

  static tryCatch(fn, errorHandler = (e) => e.message) {
    try {
      return Either.right(fn())
    } catch (error) {
      return Either.left(errorHandler(error))
    }
  }

  static async tryCatchAsync(fn, errorHandler = (e) => e.message) {
    try {
      const result = await fn()
      return Either.right(result)
    } catch (error) {
      return Either.left(errorHandler(error))
    }
  }

  isLeft() {
    return this._isLeft
  }

  isRight() {
    return !this._isLeft
  }

  map(fn) {
    return this._isLeft ? this : Either.right(fn(this.value))
  }

  mapLeft(fn) {
    return this._isLeft ? Either.left(fn(this.value)) : this
  }

  flatMap(fn) {
    return this._isLeft ? this : fn(this.value)
  }

  fold(leftFn, rightFn) {
    return this._isLeft ? leftFn(this.value) : rightFn(this.value)
  }

  getOrElse(defaultValue) {
    return this._isLeft ? defaultValue : this.value
  }

  orElse(alternative) {
    return this._isLeft ? alternative : this
  }

  filter(predicate, leftValue = 'Filter condition not met') {
    if (this._isLeft) return this
    return predicate(this.value) ? this : Either.left(leftValue)
  }

  tap(fn) {
    if (this.isRight()) {
      fn(this.value)
    }
    return this
  }

  tapLeft(fn) {
    if (this.isLeft()) {
      fn(this.value)
    }
    return this
  }

  bimap(leftFn, rightFn) {
    return this._isLeft ? Either.left(leftFn(this.value)) : Either.right(rightFn(this.value))
  }

  swap() {
    return this._isLeft ? Either.right(this.value) : Either.left(this.value)
  }

  toString() {
    return this._isLeft ? `Either.Left(${this.value})` : `Either.Right(${this.value})`
  }

  // Compatibility with existing Result class
  get isSuccess() {
    return this.isRight()
  }

  get error() {
    return this._isLeft ? this.value : null
  }

  // Chain multiple Either operations
  static sequence(eithers) {
    const results = []
    for (const either of eithers) {
      if (either.isLeft()) {
        return either
      }
      results.push(either.value)
    }
    return Either.right(results)
  }

  // Apply a function that returns Either to each element
  static traverse(array, fn) {
    const results = []
    for (const item of array) {
      const result = fn(item)
      if (result.isLeft()) {
        return result
      }
      results.push(result.value)
    }
    return Either.right(results)
  }
}

module.exports = Either
