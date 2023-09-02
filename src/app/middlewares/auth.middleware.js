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

      // verify token
      let decoded = token ? await verifyToken(token) : {}
      let user
      let requireRefresh = false

      if (decoded?.exp < Math.round(Date.now() / 1000)) {
         const refreshToken = req?.cookies?.refreshToken
         if (!refreshToken)
            throw new ErrorBuilder(
               'Invalid token, Please login',
               401,
               'TOKEN_ERROR'
            )

         decoded = await verifyRefreshToken(refreshToken)
         console.log(decoded)

         user = await Auth.verifyUser(
            {
               id: decoded?.id,
               tokenizer: decoded?.tokenizer,
               tokenIat: decoded?.iat,
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
         if (!decoded?.id)
            throw new ErrorBuilder(
               'Invalid token, Please login',
               401,
               'TOKEN_ERROR'
            )

         user = await Auth.verifyUser(
            {
               id: decoded?.id,
               tokenizer: decoded?.tokenizer,
               tokenIat: decoded?.iat,
            },
            { unsafePass: { email_verified: true, email: true, tokenizer: true, } }
         )
      } else {
         user = decoded
      }

      console.log(user)
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

      // TODO: handel disabled users
      user.tokenizer = undefined
      req.user = user
      return next()
   })
