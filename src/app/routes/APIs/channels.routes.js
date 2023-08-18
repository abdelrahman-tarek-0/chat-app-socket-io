const { Router } = require('express')

const channelController = require('../../controllers/channels.controller')
const channelUserController = require('../../controllers/channels-users.controller') 

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/', loggedIn(), channelController.getAllChannels)
router.get('/:id', loggedIn(), channelController.getChannel)

router.post('/', loggedIn(), channelController.createChannel)

router.post('/:id/invite/', loggedIn(), channelUserController.createGeneralInvite)
router.post('/:id/invite/:targetName', loggedIn(), channelUserController.createDirectInvite)

router.patch('/:id', loggedIn(), channelController.updateChannel)
router.delete('/:id', loggedIn(), channelController.deleteChannel)

module.exports = router
