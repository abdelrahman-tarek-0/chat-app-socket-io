const _path = require('path')
const { Router } = require('express')
const { loggedIn } = require('../middlewares/auth.middleware')
const { confirmEmail,changeEmail } = require('../controllers/auth.controller')
const { acceptInvite } = require('../controllers/channels-users.controller')

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
   .get('/change-email/:token', changeEmail)

router.get('/:inviteId', loggedIn(), acceptInvite)

module.exports = router
