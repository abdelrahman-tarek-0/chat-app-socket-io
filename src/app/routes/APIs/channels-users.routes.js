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

router.post('/:channelId/join/', validator.joinChannel, loggedIn(), joinChannel)
router.post(
   '/:channelId/invite/',
   validator.createGeneralInvite,
   loggedIn(),
   createGeneralInvite
)
router.post(
   '/:channelId/invite/:targetName',
   validator.createDirectInvite,
   loggedIn(),
   createDirectInvite
)

router.delete(
   '/:channelId/leave/',
   validator.leaveChannel,
   loggedIn(),
   leaveChannel
)
router.delete(
   '/:channelId/kick/:userId',
   validator.kickUser,
   loggedIn(),
   kickUser
)

module.exports = router
