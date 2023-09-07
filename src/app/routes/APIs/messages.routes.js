const { Router } = require('express')

const { getBondMessages } = require('../../controllers/messages.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/channels/:channelId', loggedIn(), getBondMessages)

module.exports = router
