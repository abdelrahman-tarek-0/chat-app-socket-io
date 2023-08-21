const { Router } = require('express')

const {
   logout,
   login,
   signup,
   sendConfirmEmail,
   forgetPassword,
   resetPassword,
} = require('../../controllers/auth.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')
const validator = require('../../validators/auth.validators')

const router = Router()

router.get('/logout', logout)

router.post('/signup', validator.signup, signup)
router.post('/login', login)

router.post(
   '/send-confirm-email',
   loggedIn({ skipEmailConfirm: true }),
   sendConfirmEmail
)
router.post('/forget-password', forgetPassword)
router.post('/reset-password', resetPassword)

module.exports = router
