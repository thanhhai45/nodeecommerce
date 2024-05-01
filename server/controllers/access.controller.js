'use strict'

const { Created } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    new Created({
      message: 'Register OK!',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res)
  }
}

module.exports = new AccessController();
