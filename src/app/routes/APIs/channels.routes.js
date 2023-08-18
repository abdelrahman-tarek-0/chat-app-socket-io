const { Router } = require('express')

const {
   getAllChannels,
   getChannel,
   createChannel,
   updateChannel,
   deleteChannel,
} = require('../../controllers/channels.controller')
const {
   createDirectInvite,
   createGeneralInvite,
   leaveChannel,
} = require('../../controllers/channels-users.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/', loggedIn(), getAllChannels)
router.get('/:id', loggedIn(), getChannel)

router.post('/', loggedIn(), createChannel)

router.post('/:id/invite/', loggedIn(), createGeneralInvite)
router.post('/:id/invite/:targetName', loggedIn(), createDirectInvite)

router.patch('/:id', loggedIn(), updateChannel)
router.delete('/leave/:id', loggedIn(), leaveChannel)
router.delete('/:id', loggedIn(), deleteChannel)

module.exports = router
