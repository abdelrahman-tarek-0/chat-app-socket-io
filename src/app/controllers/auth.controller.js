const User = require('../models/user.model')

const { signCookieToken } = require('../utils/jwtToken')

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
exports.signup = async (req, res) => {
   const { name, email, password, image_url, phone_number } = req.body

   const user = await User.signup({
      name,
      email,
      password,
      image_url,
      phone_number,
   })

   await signCookieToken(res, user.id, user.tokenizer)

   return res.status(201).json({
      status: 'success',
      data: {
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image_url: user.image_url,
            phone_number: user.phone_number,
         },
      },
   })
}

exports.login = async (req, res) => {
   const { email, password } = req.body

   const user = await User.login(email, password)

   if (!user) throw new Error('Invalid email or password')

   await signCookieToken(res, user.id, user.tokenizer)

   return res.status(200).json({
      status: 'success',
      data: {
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image_url: user.image_url,
            phone_number: user.phone_number,
         },
      },
   })
}