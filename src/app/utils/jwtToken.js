const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const { security, env } = require('../../config/app.config')

const verifyToken = (token) =>
   promisify(jwt.verify)(token, security.tokenSecret, {
      ignoreExpiration: true,
   })

const verifyRefreshToken = (token) =>
   promisify(jwt.verify)(token, security.refReshTokenSecret, {
      ignoreExpiration: true,
   })

const signToken = (data, tokenizer) =>
   promisify(jwt.sign)({ ...data, tokenizer }, security.tokenSecret, {
      expiresIn: security.tokenExpires,
   })

const signRefreshToken = (data, tokenizer) =>
   promisify(jwt.sign)({ ...data, tokenizer }, security.refReshTokenSecret, {
      expiresIn: security.refReshTokenExpires,
   })

const setCookieToken = (res, token, expires) => {
   res.cookie('token', token, {
      expires: expires || security.cookieTokenExpires(),
      httpOnly: true,
      secure: env === 'production',
   })
}

const setCookieRefreshToken = (res, token, expires) => {
   res.cookie('refreshToken', token, {
      expires: expires || security.cookieRefreshTokenExpires(),
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

const signCookieRefreshToken = async (res, data, tokenizer) => {
   const token = await signRefreshToken(data, tokenizer)
   setCookieRefreshToken(res, token)
   return token
}

module.exports = {
   verifyToken,
   verifyRefreshToken,
   
   setCookieToken,
   setCookieRefreshToken,

   signCookieToken,
   signCookieRefreshToken,
}
