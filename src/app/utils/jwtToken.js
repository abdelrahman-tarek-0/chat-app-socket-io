const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const { security } = require('../../config/app.config')

const signToken = (id, tokenizer) =>
   promisify(jwt.sign)({ id, tokenizer }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const verifyToken = (token) =>
   promisify(jwt.verify)(token, security.tokenSecret)

module.exports = { signToken, verifyToken }
