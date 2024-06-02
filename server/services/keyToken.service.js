'use strict'
const keyTokenModel = require('../models/keyToken.model')
class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // const publicKeyString = publicKey.toString()
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKeyString,
      //   privateKey,
      // })

      const filter = { user: userId }
      const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }
      const options = { upsert: true, new: true }
      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: userId }).lean();

  }

  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne({ _id: id }).lean();
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    console.log("findByRefreshTokenUsed", refreshToken)
    return await keyTokenModel.findOne({ refreshTokensUsed: { $in: [refreshToken] } })
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken })
  }

  static deleteKey = async (userId) => {
    return await keyTokenModel.deleteOne({ user: userId })
  }
}

module.exports = KeyTokenService
