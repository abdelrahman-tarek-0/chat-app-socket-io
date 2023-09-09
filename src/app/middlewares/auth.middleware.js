const catchAsync = require('../utils/catchAsync')
const {
   verifyToken,
   verifyRefreshToken,
   signCookie,
} = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const Auth = require('../models/auth.model')

const optsConfig = (opts) => {
   const defaultOpts = { skipEmailConfirm: false, populateUser: true }
   return { ...defaultOpts, ...opts }
}

exports.loggedIn = (opts = { skipEmailConfirm: false, populateUser: true }) =>
   catchAsync(async (req, res, next) => {
      opts = optsConfig(opts)

      const token = req?.cookies?.token
      const refreshToken = req?.cookies?.refreshToken
      let user = {}
      let requireRefresh = false

      // verify token
      let decodedToken = token ? await verifyToken(token) : {}
      let decodedRefreshToken = refreshToken
         ? await verifyRefreshToken(refreshToken)
         : {}

      const isTokenValid =
         token &&
         decodedToken?.exp > Math.round(Date.now() / 1000) &&
         decodedToken?.id

      const isRefreshTokenValid =
         refreshToken &&
         decodedRefreshToken?.exp > Math.round(Date.now() / 1000) &&
         decodedRefreshToken?.id

      if (!isTokenValid && !isRefreshTokenValid)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      if (!isTokenValid) {
         if (!isRefreshTokenValid)
            throw new ErrorBuilder(
               'Invalid token, Please login',
               401,
               'TOKEN_ERROR'
            )

         user = await Auth.verifyUser(
            {
               id: decodedRefreshToken?.id,
               tokenizer: decodedRefreshToken?.tokenizer,
               tokenIat: decodedRefreshToken?.iat,
            },
            {
               unsafePass: {
                  email_verified: true,
                  email: true,
                  tokenizer: true,
               },
            }
         )

         requireRefresh = true
      } else if (opts.populateUser) {
         user = await Auth.verifyUser(
            {
               id: decodedToken?.id,
               tokenizer: decodedToken?.tokenizer,
               tokenIat: decodedToken?.iat,
            },
            {
               unsafePass: {
                  email_verified: true,
                  email: true,
                  tokenizer: true,
               },
            }
         )
      } else {
         user = decodedToken
      }

      console.log(user)
      console.log(decodedToken)
      console.log(decodedRefreshToken)
      console.log(requireRefresh)

      if (!user?.id)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      if (requireRefresh)
         await signCookie(
            res,
            {
               id: user.id,
               email: user.email,
               email_verified: user.email_verified,
            },
            user.tokenizer
         )

      if (!opts.skipEmailConfirm && !user?.email_verified)
         throw new ErrorBuilder(
            'please confirm the email to start using our api',
            401,
            'CONFIRM_EMAIL'
         )

      user.tokenizer = undefined
      req.user = user
      return next()
   })
