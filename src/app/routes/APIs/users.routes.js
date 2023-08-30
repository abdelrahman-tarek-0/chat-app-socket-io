const { Router } = require('express')

const {
   getCurrentUserData,
   updateUser,
   changePassword,
   disableMe,
   sendBondRequest,
} = require('../../controllers/users.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')
const validator = require('../../validators/users.validators')

const router = Router()

router.get('/', loggedIn(), getCurrentUserData)

router.post('/send-bond-request/:userId', loggedIn(), sendBondRequest)
router.post('/accept-bond-request/:bondRequestId', loggedIn(), acceptBondRequest)

router.patch(
   '/',
   validator.updateUser,
   loggedIn({
      skipEmailConfirm: true,
   }),
   updateUser
)

router.patch(
   '/change-password',
   validator.changePassword,
   loggedIn(),
   changePassword
)
router.delete('/', loggedIn(), disableMe)

module.exports = router
