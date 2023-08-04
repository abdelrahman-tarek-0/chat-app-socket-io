const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const { security, env } = require('../../config/app.config')

const verifyToken = (token) =>
   promisify(jwt.verify)(token, security.tokenSecret)

const verifyCookieToken = async (req) => {
   const token = req?.cookies?.token
   if (!token) return null
   return await verifyToken(token)
}

const signToken = (id, tokenizer) =>
   promisify(jwt.sign)({ id, tokenizer }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const setCookieToken = (res, token) => {
   res.cookie('token', token, {
      expires: security.cookieExpires(),
      httpOnly: true,
      secure: env === 'production',
   })
}
const signCookieToken = async (res, id, tokenizer) => {
   const token = await signToken(id, tokenizer)
   setCookieToken(res, token)
   return token
}

module.exports = {
   signToken,
   verifyToken,
   setCookieToken,
   verifyCookieToken,
   signCookieToken,
}
