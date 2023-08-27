const Auth = require('../models/auth.model')
const resBuilder = require('../utils/responseBuilder')

const { signCookieToken, setCookieToken } = require('../utils/jwtToken')
const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

const { confirmEmailDone } = require('../views/emails.views')

const {
   createAndSendConfirmEmail,
   createAndSendResetPassword,
   createAndSendChangeEmail,
} = require('../helpers/auth.helpers')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = catchAsync(async (req, res) => {
   // create user
   const user = await Auth.signup(req.body, {
      unsafePass: { tokenizer: true },
   })

   // login the user
   await signCookieToken(
      res,
      {
         id: user.id,
         email: user.email,
         email_verified: user.email_verified,
      },
      user.tokenizer
   )

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
      unsafePass: { tokenizer: true },
   })

   if (!user?.id)
      throw new ErrorBuilder(
         'Invalid email or password',
         401,
         'INVALID_CREDENTIALS'
      )

   await signCookieToken(
      res,
      {
         id: user.id,
         email: user.email,
         email_verified: user.email_verified,
      },
      user.tokenizer
   )

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

   const user = await Auth.confirmEmail(
      { token, id },
      {
         unsafePass: { tokenizer: true },
      }
   )

   if (!user?.id)
      throw new ErrorBuilder(
         'User not found or already confirmed',
         400,
         'INVALID'
      )

   await signCookieToken(
      res,
      {
         id: user.id,
         email: user.email,
         email_verified: user.email_verified,
      },
      user.tokenizer
   )
   user.tokenizer = undefined

   return res.status(200).send(confirmEmailDone({ username }))
})

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.sendChangeEmail = catchAsync(async (req, res) => {
   const { email } = req.user
   const { email: newEmail } = req.body

   if (email === newEmail)
      throw new ErrorBuilder(
         'Your new email is same as old email',
         400,
         'INVALID'
      )

   createAndSendChangeEmail(req.user, Auth, {
      protocol: req.protocol,
      host: req.get('host'),
      newEmail,
   }).catch(console.error)

   return resBuilder(res, 201, 'Your email change request is sent')
})

exports.changeEmail = catchAsync(async (req, res) => {
   const { token } = req.params
   const { id, username, newEmail } = req.query

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
   const user = await Auth.resetPassword(req.body, {
      unsafePass: { tokenizer: true },
   })

   if (!user?.id)
      throw new ErrorBuilder(
         'Something went wrong please try again later',
         500,
         'INTERNAL_ERROR'
      )

   await signCookieToken(
      res,
      {
         id: user.id,
         email: user.email,
         email_verified: user.email_verified,
      },
      user.tokenizer
   )
   user.tokenizer = undefined

   return resBuilder(res, 200, 'Password reset')
})
