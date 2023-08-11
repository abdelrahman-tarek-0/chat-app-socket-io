const { Router } = require('express')

const controller = require('../../controllers/auth.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.post('/signup', controller.signup)
router.post('/login', controller.login)

router.post(
   '/sendConfirmEmail',
   loggedIn({ skipEmailConfirm: true }),
   controller.sendConfirmEmail
)
router.post('/forgetPassword', controller.forgetPassword)
router.post('/resetPassword', controller.resetPassword)

router.get('/confirmEmail/:token', controller.confirmEmail)

module.exports = router
