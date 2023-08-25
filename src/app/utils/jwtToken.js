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

const signToken = (data, tokenizer) =>
   promisify(jwt.sign)({ ...data, tokenizer }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const setCookieToken = (res, token, expires) => {
   res.cookie('token', token, {
      expires: expires || security.cookieExpires(),
      httpOnly: true,
      secure: env === 'production',
   })
}
// data: { id, email, email_verified}
const signCookieToken = async (res, data, tokenizer) => {
   const token = await signToken(data, tokenizer)
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
