const { Router } = require('express')

const controller = require('../../controllers/channels.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/', loggedIn(), controller.getAllChannels)
router.get('/:id', loggedIn(), controller.getChannel)
router.post('/', loggedIn(), controller.createChannel)
router.patch('/:id', loggedIn(), controller.updateChannel)

module.exports = router
