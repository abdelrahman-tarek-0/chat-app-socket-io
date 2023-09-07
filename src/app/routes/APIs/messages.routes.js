const { Router } = require('express')

const { getMessages } = require('../../controllers/messages.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/channels/:channelId', loggedIn(), getMessages('channel'))

module.exports = router
