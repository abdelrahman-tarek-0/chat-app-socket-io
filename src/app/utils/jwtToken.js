const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const { security, env } = require('../../config/app.config')

const signToken = (id, tokenizer) =>
   promisify(jwt.sign)({ id, tokenizer }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const verifyToken = (token) =>
   promisify(jwt.verify)(token, security.tokenSecret)

const setCookieToken = (res, token) => {
   res.cookie('token', token, {
      expires: security.cookieExpires(),
      httpOnly: true,
      secure: env === 'production',
   })
}

const verifyCookieToken = (req) => {
   const token = req.cookies.token
   if (!token) return null
   return verifyToken(token)
}

const signCookieToken = (req, id, tokenizer) => {
   const token = signToken(id, tokenizer)
   setCookieToken(req, token)
   return token
}

module.exports = {
   signToken,
   verifyToken,
   setCookieToken,
   verifyCookieToken,
   signCookieToken,
}
