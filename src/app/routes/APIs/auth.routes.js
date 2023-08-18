const _path = require('path')
const { Router } = require('express')

const controller = require('../../controllers/auth.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/logout', controller.logout)



router.post('/signup', controller.signup)
router.post('/login', controller.login)

router.post(
   '/send-confirm-email',
   loggedIn({ skipEmailConfirm: true }),
   controller.sendConfirmEmail
)
router.post('/forget-password', controller.forgetPassword)
router.post('/reset-password', controller.resetPassword)

module.exports = router
