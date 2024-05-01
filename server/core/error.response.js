'use strict'

const STATUS_CODE = {
  FORBIDDEN: 403,
  CONFLICT: 409,

}

const REASON_STATUS_CODE = {
  FORBIDDEN: 'Bad request error',
  CONFLICT: 'Conflict error',
}

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message = REASON_STATUS_CODE.CONFLICT, statusCode = STATUS_CODE.CONFLICT) {
    super(message, statusCode)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = REASON_STATUS_CODE.FORBIDDEN, statusCode = STATUS_CODE.FORBIDDEN) {
    super(message, statusCode)
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError
}