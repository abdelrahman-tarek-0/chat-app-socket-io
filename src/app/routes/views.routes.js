const _path = require('path')
const { Router } = require('express')
const { loggedIn } = require('../middlewares/auth.middleware')
const { confirmEmail, changeEmail } = require('../controllers/auth.controller')
const { acceptInvite } = require('../controllers/channels-users.controller')
const authValidator = require('../validators/auth.validators')

const router = Router()
router.get('/', (req, res) => {
   res.sendFile(
      _path.join(__dirname, '..', '..', 'public', 'pages', 'index.html')
   )
})

router
   .get('/confirm-email/:token', confirmEmail)
   .get('/reset-password', (req, res) =>
      res.sendFile(_path.join(__dirname, '..', 'views', 'password-reset.html'))
   )
   .get('/change-email/:token', authValidator.changeEmail, changeEmail)

router.get('/invite/:inviteId', loggedIn(), acceptInvite)

module.exports = router
