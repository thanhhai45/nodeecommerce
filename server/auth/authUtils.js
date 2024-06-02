'use strict'
const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');
const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rftoken-id'
}
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days',
    })

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days'
    })


    // verify token key
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Error verify:: ${err}`)
      } else {
        console.log(`Decode verify:: ${decode}`)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {
    return error;
  }
}

// const authenticationV1 = asyncHandler(async (req, res, next) => {
//   const userId = req.headers[HEADER.CLIENT_ID]
//   if (!userId) throw new AuthFailureError('Invalid Request')

//   const keyStore = await findByUserId(userId);
//   if (!keyStore) throw new NotFoundError('Not found keyStore')

//   const accessToken = req.headers[HEADER.AUTHORIZATION]
//   if (!accessToken) throw new AuthFailureError('Invalid Request')

//   try {
//     const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
//     if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')

//     req.keyStore = keyStore
//     return next()
//   } catch (error) {
//     throw error
//   }

// })

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request')

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found keyStore')

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.publicKey)
      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')

      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid Request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')

    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }

})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
}