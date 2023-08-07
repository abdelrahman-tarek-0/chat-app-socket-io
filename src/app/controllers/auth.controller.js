const User = require('../models/users.model')

const { signCookieToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')
const { safeUser } = require('../utils/safeModel')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = catchAsync(async (req, res) => {
   const { username,display_name, email, password } = req.body

   const user = await User.signup({
      username,
      display_name,
      email,
      password,
   })
   console.log(user)

   await signCookieToken(res, user.id, user.tokenizer)

   return res.status(201).json({
      status: 'success',
      data: {
         user: safeUser(user, { email: true }),
      },
   })
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.login = catchAsync(async (req, res) => {
   const { email, password } = req.body

   const user = await User.login(email, password)

   if (!user?.id)
      throw new ErrorBuilder(
         'Invalid email or password',
         401,
         'INVALID_CREDENTIALS'
      )

   await signCookieToken(res, user.id, user.tokenizer)

   return res.status(200).json({
      status: 'success',
      data: {
         user: safeUser(user, { email: true }),
      },
   })
})
