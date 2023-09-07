const { Router } = require('express')

const {} = require('../../controllers/messages.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

module.exports = router