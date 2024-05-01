'use strict'

const STATUS_CODE = {
  OK: 200,
  CREATED: 201
}

const REASON_STATUS_CODE = {
  OK: 'Success',
  CREATED: 'Created'
}

class SuccessResponse {
  constructor({ message, statusCode = STATUS_CODE.OK,
    reasonStatusCode = REASON_STATUS_CODE.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message
    this.status = statusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata })
  }
}

class Created extends SuccessResponse {
  constructor({ options = {}, message, statusCode = STATUS_CODE.CREATED, reasonStatusCode = REASON_STATUS_CODE.CREATED, metadata }) {
    super({ message, statusCode, reasonStatusCode, metadata })
    this.options = options
  }
}

module.exports = {
  OK,
  Created
}