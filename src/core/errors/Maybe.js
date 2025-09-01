/**
 * Maybe Monad - Represents a value that might be null or undefined
 * Helps avoid null pointer exceptions and provides functional composition
 */
class Maybe {
  constructor(value) {
    this.value = value
  }

  static of(value) {
    return new Maybe(value)
  }

  static some(value) {
    return new Maybe(value)
  }

  static none() {
    return new Maybe(null)
  }

  static fromNullable(value) {
    return value == null ? Maybe.none() : Maybe.some(value)
  }

  isNone() {
    return this.value == null
  }

  isSome() {
    return this.value != null
  }

  map(fn) {
    return this.isNone() ? Maybe.none() : Maybe.of(fn(this.value))
  }

  flatMap(fn) {
    return this.isNone() ? Maybe.none() : fn(this.value)
  }

  filter(predicate) {
    return this.isNone() || !predicate(this.value) ? Maybe.none() : this
  }

  getOrElse(defaultValue) {
    return this.isNone() ? defaultValue : this.value
  }

  getOrThrow(error = new Error('Maybe is None')) {
    if (this.isNone()) {
      throw error
    }
    return this.value
  }

  fold(onNone, onSome) {
    return this.isNone() ? onNone() : onSome(this.value)
  }

  orElse(alternative) {
    return this.isNone() ? alternative : this
  }

  toString() {
    return this.isNone() ? 'Maybe.None' : `Maybe.Some(${this.value})`
  }
}

module.exports = Maybe
