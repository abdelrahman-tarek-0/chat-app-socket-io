const User = require('../models/users.model')

const { signCookieToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = catchAsync(async (req, res) => {
   const { username, display_name, email, password } = req.body

   const user = await User.signup(
      {
         username,
         display_name,
         email,
         password,
      },
      { unsafePass: { email: true } }
   )
   console.log(user)

   await signCookieToken(res, user.id, user.tokenizer)

   return res.status(201).json({
      status: 'success',
      data: {
         user,
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

   const user = await User.login(
      { email, password },
      { unsafePass: { email: true, tokenizer: true } }
   )

   if (!user?.id)
      throw new ErrorBuilder(
         'Invalid email or password',
         401,
         'INVALID_CREDENTIALS'
      )

   await signCookieToken(res, user.id, user.tokenizer)
   user.tokenizer = undefined

   return res.status(200).json({
      status: 'success',
      data: {
         user,
      },
   })
})
