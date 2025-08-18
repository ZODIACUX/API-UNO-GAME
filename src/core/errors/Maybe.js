/**
 * Maybe Monad for handling nullable values
 * Implements functional error handling patterns
 */
class Maybe {
  constructor(value) {
    this.value = value
  }

  static of(value) {
    return new Maybe(value)
  }

  static none() {
    return new Maybe(null)
  }

  static some(value) {
    return new Maybe(value)
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

  orElse(alternative) {
    return this.isNone() ? alternative : this
  }

  fold(onNone, onSome) {
    return this.isNone() ? onNone() : onSome(this.value)
  }

  tap(fn) {
    if (this.isSome()) {
      fn(this.value)
    }
    return this
  }

  toString() {
    return this.isNone() ? 'Maybe.None' : `Maybe.Some(${this.value})`
  }
}

module.exports = Maybe
