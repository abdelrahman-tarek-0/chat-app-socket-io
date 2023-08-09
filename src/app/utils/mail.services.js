const nodemailer = require('nodemailer')

const { mailDev } = require('../../config/app.config')

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

module.exports = {
   sendMail,
}
