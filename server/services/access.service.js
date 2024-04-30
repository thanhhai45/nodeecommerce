'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils')
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: '0002',
  EDITOR: '0003',
  ADMIN: '0001'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check exists email??
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        return {
          code: 'xxxx',
          message: 'Shop already registered with this email'
        }
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
          publicKey
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
          metadate: {
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
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
