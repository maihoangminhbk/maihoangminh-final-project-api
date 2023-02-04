import { HttpStatusCode } from '../constants'
import { BaseError } from './baseError'

export class Api404Error extends BaseError {
  constructor (
    name,
    statusCode = HttpStatusCode.NOT_FOUND,
    description = 'Not found.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}


