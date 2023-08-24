const { Router } = require('express')

const {
   createDirectInvite,
   createGeneralInvite,
   leaveChannel,
   kickUser,
   joinChannel,
} = require('../../controllers/channels-users.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const validator = require('../../validators/channels-users.validators')

const router = Router()

router.post('/:channelId/join/', loggedIn(), joinChannel)
router.post('/:channelId/invite/',validator.createGeneralInvite, loggedIn(), createGeneralInvite)
router.post('/:channelId/invite/:targetName', validator.createDirectInvite, loggedIn(), createDirectInvite)

router.delete('/:channelId/leave/', loggedIn(), leaveChannel)
router.delete('/:channelId/kick/:userId', loggedIn(), kickUser)

module.exports = router
