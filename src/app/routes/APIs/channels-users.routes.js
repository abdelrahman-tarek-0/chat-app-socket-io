const { Router } = require('express')

const {
    createDirectInvite,
    createGeneralInvite,
    leaveChannel,
    kickUser,
    joinChannel,
 } = require('../../controllers/channels-users.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.post('/:channelId/join/', loggedIn(), joinChannel)
router.post('/:channelId/invite/', loggedIn(), createGeneralInvite)
router.post('/:channelId/invite/:targetName', loggedIn(), createDirectInvite)

router.delete('/:channelId/leave/', loggedIn(), leaveChannel)
router.delete('/:channelId/kick/:userId', loggedIn(), kickUser)

module.exports = router