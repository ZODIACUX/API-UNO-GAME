class Result {
  constructor(value, error, isSuccess) {
    this.value = value
    this.error = error
    this.isSuccess = isSuccess
  }

  static success(value) {
    return new Result(value, null, true)
  }

  static failure(error) {
    return new Result(null, error, false)
  }

  static from(fn) {
    try {
      const result = fn()
      return Result.success(result)
    } catch (error) {
      return Result.failure(error)
    }
  }

  static async fromAsync(fn) {
    try {
      const result = await fn()
      return Result.success(result)
    } catch (error) {
      return Result.failure(error)
    }
  }

  map(fn) {
    if (!this.isSuccess) {
      return this
    }
    try {
      return Result.success(fn(this.value))
    } catch (error) {
      return Result.failure(error)
    }
  }

  flatMap(fn) {
    if (!this.isSuccess) {
      return this
    }
    try {
      return fn(this.value)
    } catch (error) {
      return Result.failure(error)
    }
  }

  mapError(fn) {
    if (this.isSuccess) {
      return this
    }
    return Result.failure(fn(this.error))
  }

  fold(onSuccess, onFailure) {
    return this.isSuccess ? onSuccess(this.value) : onFailure(this.error)
  }

  getOrElse(defaultValue) {
    return this.isSuccess ? this.value : defaultValue
  }

  getOrThrow() {
    if (!this.isSuccess) {
      throw this.error
    }
    return this.value
  }
}

module.exports = Result
