const nodemailer = require('nodemailer')
const { htmlToText } = require('html-to-text')

const { mailDev } = require('../../config/app.config')
const emailTemplate = require('../views/emails.views')

const transport = nodemailer.createTransport({
   host: mailDev.host,
   port: mailDev.port,
   auth: {
      user: mailDev.user,
      pass: mailDev.pass,
   },
})

const sendMail = async (to, subject, html, text) => {
   const mailOptions = {
      from: 'Clean <Clean@gmail.com>',
      to,
      subject,
      html,
      text,
   }

   const info = await transport.sendMail(mailOptions)
   return info
}

const sendConfirmEmail = async ({ username, URL, email }) => {
   const html = emailTemplate.confirmEmail({ username, URL })
   const text = htmlToText(html)

   const info = await sendMail(email, 'Confirm your email', html, text)
   return info
}

const sendResetPassword = async ({ username, URL, email }) => {
   const html = emailTemplate.forgetPassword({ username, URL })
   const text = htmlToText(html)

   const info = await sendMail(email, 'Reset Password', html, text)
   return info
}
module.exports = { sendConfirmEmail, sendResetPassword }
