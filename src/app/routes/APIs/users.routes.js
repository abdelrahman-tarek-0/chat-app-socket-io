const { Router } = require('express')

const {
   getUserProfile,
   updateUser,
   changePassword,
   disableMe,
} = require('../../controllers/users.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')
const validator = require('../../validators/users.validators')

const router = Router()

router.get('/me', loggedIn(), getUserProfile)
router.patch('/', validator.updateUser, loggedIn(), updateUser)
router.patch('/change-password', loggedIn(), changePassword)
router.delete('/', loggedIn(), disableMe)

module.exports = router
