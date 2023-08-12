const _path = require('path')
const { Router } = require('express')

const controller = require('../../controllers/auth.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/logout', controller.logout)

router
   .get('/views/confirmEmail/:token', controller.confirmEmail)
   .get('/views/resetPassword', (req, res) =>
      res.sendFile(
         _path.join(__dirname, '..', '..', 'views', 'password-reset.html')
      )
   )

router.post('/signup', controller.signup)
router.post('/login', controller.login)

router.post(
   '/sendConfirmEmail',
   loggedIn({ skipEmailConfirm: true }),
   controller.sendConfirmEmail
)
router.post('/forgetPassword', controller.forgetPassword)
router.post('/resetPassword', controller.resetPassword)

module.exports = router
