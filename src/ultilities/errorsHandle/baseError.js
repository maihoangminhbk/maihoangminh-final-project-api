export class BaseError extends Error {
  constructor (description, name, statusCode, isOperational) {
    super(description)

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = name
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this)
  }
}