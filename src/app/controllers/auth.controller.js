const Auth = require('../models/auth.model')

const { signCookieToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')
const {
   sendConfirmEmail,
   sendResetPassword,
} = require('../services/mail.services')
const { confirmEmailDone } = require('../views/emails.views')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = catchAsync(async (req, res) => {
   const { username, display_name, email, password } = req.body

   // create user
   const user = await Auth.signup(
      {
         username,
         display_name,
         email,
         password,
      },
      { unsafePass: { email: true, tokenizer: true } }
   )

   // login the user
   await signCookieToken(res, user.id, user.tokenizer)
   user.tokenizer = undefined

   // send confirm email
   const { verification } = await Auth.createReset({
      email,
      type: 'token_link',
      verificationFor: 'confirm_email',
   })
   await sendConfirmEmail({
      username: user.username,
      URL: `${req.protocol}://${req.get('host')}/api/v1/auth/confirmEmail/${
         verification.reset
      }?email=${user.email}&username=${user.username}`,
      email: user.email,
   })

   // res
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

   const user = await Auth.login(
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

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.sendConfirmEmail = catchAsync(async (req, res) => {
   const { email } = req.user

   const { verification, user } = await Auth.createReset({
      email,
      type: 'token_link',
      verificationFor: 'confirm_email',
   })

   await sendConfirmEmail({
      username: user.username,
      URL: `${req.protocol}://${req.get('host')}/api/v1/auth/confirmEmail/${
         verification.reset
      }?email=${user.email}&username=${user.username}`,
      email: user.email,
   })

   return res.status(201).json({
      status: 'success',
      message: 'Email sent',
   })
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.confirmEmail = catchAsync(async (req, res) => {
   const { token } = req.params
   const { email, username } = req.query

   await Auth.confirmEmail({ token, email })

   return res.status(200).send(confirmEmailDone({ username }))
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.forgetPassword = catchAsync(async (req, res) => {
   const { email } = req.body

   const { verification, user } = await Auth.createReset({
      email,
      type: 'token_link',
      verificationFor: 'reset_password',
   })

   await sendResetPassword({
      username: user.username,
      URL: `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${
         verification.reset
      }?email=${user.email}&username=${user.username}`,
      email: user.email,
   })

   return res.status(201).json({
      status: 'success',
      message: 'Email sent',
   })
})
