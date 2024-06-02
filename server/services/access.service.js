'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const keyTokenModel = require('../models/keyToken.model');
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: '0002',
  EDITOR: '0003',
  ADMIN: '0001'
}

class AccessService {

  static handlerRefreshToken = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKey(userId)
      throw new ForbiddenError("Something wrong happend!! Please resignin")
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered")
    }

    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailureError("Shop not registered")

    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)
    await keyTokenModel.updateOne(
      { _id: keyStore._id },
      {
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken
        }
      }
    );

    return {
      user,
      tokens
    }
  }

  static signOut = async (keyStore) => {
    console.log("keyStore", keyStore._id);
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    return delKey
  }

  static signIn = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email })

    if (!foundShop) throw new BadRequestError('Error: Shop not registed')

    const match = bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailureError('Authentication Error')

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    })
    const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    })

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop
      }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    // step 1: check exists email??
    const holderShop = await shopModel.findOne({ email }).lean()
    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered')
    }

    // step 2: bcrypt password 
    const passwordHash = await bcrypt.hash(password, 10)

    // step 3: create new shop
    const newShop = await shopModel.create({
      name, email, password: passwordHash, roles: [RoleShop.SHOP]
    })

    // Check create success
    if (newShop) {
      // created privateKey, publicKey
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
      })
      console.log({ privateKey, publicKey });

      // save token to database
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey
      })

      if (!publicKeyString) {
        return {
          code: 'xxxx',
          message: 'publicKeyString error'
        }
      }

      const publicKeyObject = crypto.createPublicKey(publicKeyString)
      // created token pair
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)
      console.log(`Created Token Success:: ${tokens}`)
      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop
          }),
          tokens
        }
      }
    }

    return {
      code: 200,
      metadata: null
    }
  }
}

module.exports = AccessService
