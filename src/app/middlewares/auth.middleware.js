const catchAsync = require('../utils/catchAsync')
const { verifyToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const User = require('../models/user.model')

exports.loggedIn = (opts = { skipEmailConfirm: false }) =>
   catchAsync(async (req, res, next) => {
      // check if token is provided
      let token = req?.cookies?.token
      if (!token)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      // verify token
      let decoded = await verifyToken(token)
      let user = await User.getUser(decoded.id, 'id')

      if (!user)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      const passwordChangedAt = new Date(
         user?.last_password_change_at || 0
      ).getTime()
      const tokenIssuedAt = new Date(decoded?.iat * 1000 || 0).getTime()

      if (passwordChangedAt >= tokenIssuedAt)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      if (user?.tokenizer !== decoded?.tokenizer)
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

      req.user = user
      return next()
   })
