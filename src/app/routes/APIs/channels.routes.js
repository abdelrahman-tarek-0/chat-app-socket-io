const { Router } = require('express')

const controller = require('../../controllers/channels.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/getChannelMetadata/:id', loggedIn(), controller.getChannelMetadata)

module.exports = router
