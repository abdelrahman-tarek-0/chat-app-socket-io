const User = require('../models/user.model')

const { signCookieToken } = require('../utils/jwtToken')

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
exports.signup = async (req, res) => {
    const { name, email, password, image_url, phone_number } = req.body
    
    const {tokenizer,user} = await User.create({
        name,
        email,
        password,
        image_url,
        phone_number,
    })
    
    await signCookieToken(res, user.id, tokenizer)
    
    return res.status(201).json({
        status: 'success',
        data: {
            user,
        },
    })
}
