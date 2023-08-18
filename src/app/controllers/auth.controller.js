const Auth = require('../models/auth.model')
const resBuilder = require('../utils/responseBuilder')

const { signCookieToken, setCookieToken } = require('../utils/jwtToken')
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
      URL: `${req.protocol}://${req.get(
         'host'
      )}/confirm-email/${verification.reset}?id=${
         user.id
      }&username=${user.username}`,
      email: user.email,
   })

   return resBuilder(res, 201,'User Is created and email send to the user to confirm', user)
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

   return resBuilder(res, 200, 'User is logged in', user)
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.logout = catchAsync(async (req, res) => {
   setCookieToken(res, '', new Date())

   return resBuilder(res, 200, 'Logged out')
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.sendConfirmEmail = catchAsync(async (req, res) => {
   const { email,email_verified } = req.user

   if (email_verified) throw new ErrorBuilder('Email already confirmed', 400)

   const { verification, user } = await Auth.createReset({
      email,
      type: 'token_link',
      verificationFor: 'confirm_email',
   })

   await sendConfirmEmail({
      username: user.username,
      URL: `${req.protocol}://${req.get(
         'host'
      )}/confirm-email/${verification.reset}?id=${
         user.id
      }&username=${user.username}`,
      email: user.email,
   })

   return resBuilder(res, 201, 'Confirmation email sent')
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.confirmEmail = catchAsync(async (req, res) => {
   const { token } = req.params
   const { id, username } = req.query

   await Auth.confirmEmail({ token, id })

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
      URL: `${req.protocol}://${req.get(
         'host'
      )}/reset-password?token=${verification.reset}&id=${
         user.id
      }`,
      email: user.email,
   })

   return resBuilder(res, 201, 'Reset password email sent')
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.resetPassword = catchAsync(async (req, res) => {
   const { token, id, password } = req.body

   await Auth.resetPassword({ token, id, password })

   return resBuilder(res, 200, 'Password reset')
})
