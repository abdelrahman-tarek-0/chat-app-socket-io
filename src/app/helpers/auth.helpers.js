const {
   sendConfirmEmail,
   sendResetPassword,
   sendChangeEmail,
} = require('../services/mail.services')

const ErrorBuilder = require('../utils/ErrorBuilder')

// i am adding the AuthModel as a parameter because i don't want to import it in this file
// because it will create a circular dependency
// if i wanted to import this file in the AuthModel file

// controller
exports.createAndSendConfirmEmail = async (
   user,
   AuthModel,
   { protocol, host }
) => {
   const verification = await AuthModel.createReset({
      email: user.email,
      type: 'token_link',
      verificationFor: 'confirm_email',
   })

   await sendConfirmEmail({
      username: user.username,
      URL: `${protocol}://${host}/confirm-email/${verification.reset}?id=${user.id}&username=${user.username}`,
      email: user.email,
   })
}

exports.createAndSendChangeEmail = async (
   user,
   AuthModel,
   { protocol, host, newEmail }
) => {
   const verification = await AuthModel.createReset({
      email: user.email,
      type: 'token_link',
      verificationFor: 'change_email',
   })

   await sendChangeEmail({
      username: user.username,
      URL: `${protocol}://${host}/change-email/${verification.reset}?id=${user.id}&username=${user.username}&newEmail=${newEmail}`,
      email: user.email,
      newEmail,
   })
}

exports.createAndSendResetPassword = async (
   user,
   AuthModel,
   { protocol, host }
) => {
   const verification = await AuthModel.createReset({
      email: user.email,
      type: 'token_link',
      verificationFor: 'reset_password',
   })

   await sendResetPassword({
      URL: `${protocol}://${host}/reset-password?token=${verification.reset}&id=${verification.user_id}`,
      email: user.email,
   })
}

// model
exports.getVerification = async (db, { id, token, verificationFor }) => {
   const verification = await db('verifications')
      .select('*')
      .where({
         user_id: id,
         reset: token,
         verification_for: verificationFor,
         status: 'active',
      })
      .first()

   if (!verification?.id)
      throw new ErrorBuilder(
         'Invalid or Already Used Token Please Try Again Later',
         400,
         'INVALID'
      )

   if (verification?.expires_at < new Date().getTime())
      throw new ErrorBuilder('Expired', 400, 'EXPIRED')

   return verification
}
