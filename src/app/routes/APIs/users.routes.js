const { Router } = require('express')

const controller = require('../../controllers/users.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/me', loggedIn(), controller.getUserProfile)

module.exports = router