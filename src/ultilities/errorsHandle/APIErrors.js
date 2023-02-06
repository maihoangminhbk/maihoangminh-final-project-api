import { HttpStatusCode } from '../constants'
import { BaseError } from './baseError'

export class NotFound404Error extends BaseError {
  constructor (
    description,
    statusCode = HttpStatusCode.NOT_FOUND,
    name = 'Not found',
    isOperational = true
  ) {
    super(description, name, statusCode, isOperational)
  }
}

export class Conflict409Error extends BaseError {
  constructor (
    description,
    statusCode = HttpStatusCode.CONFLICT,
    name = 'Conflict',
    isOperational = true
  ) {
    super(description, name, statusCode, isOperational)
  }
}

export class Unauthorized401Error extends BaseError {
  constructor (
    description,
    statusCode = HttpStatusCode.UNAUTHORIZED,
    name = 'Unauthorized',
    isOperational = true
  ) {
    super(description, name, statusCode, isOperational)
  }
}

