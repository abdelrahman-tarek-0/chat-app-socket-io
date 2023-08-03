const jwt = require('jsonwebtoken')

const { security } = require('../../config/app.config')

const signToken = (id) =>
   promisify(jwt.sign)({ id: id }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const verifyToken = (token) =>
   promisify(jwt.verify)(token, security.tokenSecret)

module.exports = { signToken, verifyToken }
