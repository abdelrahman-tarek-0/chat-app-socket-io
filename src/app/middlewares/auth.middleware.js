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
      let decoded = token ? await verifyToken(token):{}
      let user
      let requireRefresh = false

      if (decoded?.exp < Math.random(Date.now() / 1000)) {
         const refreshToken = req?.cookies?.refreshToken
         if (!refreshToken)
            throw new ErrorBuilder(
               'Invalid token, Please login',
               401,
               'TOKEN_ERROR'
            )

         decoded = await verifyRefreshToken(refreshToken)

         user = Auth.verifyUser(
            {
               id: decoded?.id,
               tokenizer: decoded?.tokenizer,
               tokenIat: decoded?.iat,
            },
            { unsafePass: { email_verified: true, email: true } }
         )
         requireRefresh = true
      } else if (opts.populateUser) {
         user = await Auth.verifyUser(
            {
               id: decoded?.id,
               tokenizer: decoded?.tokenizer,
               tokenIat: decoded?.iat,
            },
            { unsafePass: { email_verified: true, email: true } }
         )
      } else {
         user = decoded
      }

      if (!user?.id)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      if (!opts.skipEmailConfirm && !user?.email_verified)
         throw new ErrorBuilder(
            'please confirm the email to start using our api',
            401,
            'CONFIRM_EMAIL'
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

      // TODO: handel disabled users
      req.user = user
      return next()
   })
