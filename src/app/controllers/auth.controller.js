const Auth = require('../models/auth.model')
const resBuilder = require('../utils/responseBuilder')

const { signCookieToken, setCookieToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

const { confirmEmailDone } = require('../views/emails.views')

const {
   createAndSendConfirmEmail,
   createAndSendResetPassword,
} = require('../helpers/auth.helpers')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = catchAsync(async (req, res) => {
   console.log('req.body: ', req.body)

   // create user
   const user = await Auth.signup(req.body, {
      unsafePass: { email: true, tokenizer: true },
   })

   // login the user
   await signCookieToken(res, user.id, user.tokenizer)
   user.tokenizer = undefined

   // send confirm email
   createAndSendConfirmEmail(user, Auth, {
      protocol: req.protocol,
      host: req.get('host'),
   }).catch(console.error)

   return resBuilder(
      res,
      201,
      'User Is created and email send to the user to confirm',
      user
   )
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.login = catchAsync(async (req, res) => {
   const user = await Auth.login(req.body, {
      unsafePass: { email: true, tokenizer: true },
   })

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
   const { email_verified } = req.user

   if (email_verified) throw new ErrorBuilder('Email already confirmed', 400)

   createAndSendConfirmEmail(req.user, Auth, {
      protocol: req.protocol,
      host: req.get('host'),
   }).catch(console.error)

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
   createAndSendResetPassword(req.body, Auth, {
      protocol: req.protocol,
      host: req.get('host'),
   }).catch(console.error)

   return resBuilder(res, 201, 'Reset password email sent')
})

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.resetPassword = catchAsync(async (req, res) => {
   await Auth.resetPassword(req.body)

   return resBuilder(res, 200, 'Password reset')
})
