const catchAsync = require('../utils/catchAsync')
const { verifyToken } = require('../utils/jwtToken')
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
      if (!token)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      // verify token
      const decoded = await verifyToken(token)
      console.log(decoded)

      let user = decoded
      if (opts.populateUser)
         user = await Auth.verifyUser(
            {
               id: decoded?.id,
               tokenizer: decoded?.tokenizer,
               tokenIat: decoded?.iat,
            },
            { unsafePass: { email_verified: true, email: true } }
         )
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
      // TODO: handel disabled users
      req.user = user
      return next()
   })
