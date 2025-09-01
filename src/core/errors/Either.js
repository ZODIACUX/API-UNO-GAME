/**
 * Either Monad - Represents a value that can be either Left (error) or Right (success)
 * Used for functional error handling and composition
 */
class Either {
  constructor(value, isLeft = false) {
    this.value = value
    this.isLeft = isLeft
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

  static tryCatch(fn, errorHandler = (e) => e) {
    try {
      const result = fn()
      return Either.right(result)
    } catch (error) {
      return Either.left(errorHandler(error))
    }
  }

  static async tryCatchAsync(fn, errorHandler = (e) => e) {
    try {
      const result = await fn()
      return Either.right(result)
    } catch (error) {
      return Either.left(errorHandler(error))
    }
  }

  get isRight() {
    return !this.isLeft
  }

  map(fn) {
    return this.isLeft ? this : Either.right(fn(this.value))
  }

  mapLeft(fn) {
    return this.isLeft ? Either.left(fn(this.value)) : this
  }

  flatMap(fn) {
    return this.isLeft ? this : fn(this.value)
  }

  fold(leftFn, rightFn) {
    return this.isLeft ? leftFn(this.value) : rightFn(this.value)
  }

  getOrElse(defaultValue) {
    return this.isLeft ? defaultValue : this.value
  }

  getOrThrow() {
    if (this.isLeft) {
      throw this.value
    }
    return this.value
  }

  swap() {
    return new Either(this.value, !this.isLeft)
  }

  filter(predicate, errorValue = 'Filter predicate failed') {
    if (this.isLeft) return this
    return predicate(this.value) ? this : Either.left(errorValue)
  }

  orElse(alternative) {
    return this.isLeft ? alternative : this
  }

  toString() {
    return this.isLeft ? `Either.Left(${this.value})` : `Either.Right(${this.value})`
  }
}

module.exports = Either
