const catchAsync = require('../utils/catchAsync')
const { verifyToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const Auth = require('../models/auth.model')

exports.loggedIn = (opts = { skipEmailConfirm: false }) =>
   catchAsync(async (req, res, next) => {
      // check if token is provided
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

      const user = await Auth.verifyUser(
         {
            id: decoded?.id,
            tokenizer: decoded?.tokenizer,
            tokenIat: decoded?.iat,
         },
         { unsafePass: { email_verified: true } }
      )

      if (!user?.id || !user)
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
