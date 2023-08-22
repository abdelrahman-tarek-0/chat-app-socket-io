const {
   sendConfirmEmail,
   sendResetPassword,
} = require('../services/mail.services')

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
