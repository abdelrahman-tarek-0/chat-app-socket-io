const { Router } = require('express')

const {
   getAllChannels,
   getChannel,
   createChannel,
   updateChannel,
   deleteChannel,
} = require('../../controllers/channels.controller')

const { loggedIn } = require('../../middlewares/auth.middleware')

const validator = require('../../validators/channels.validators')

const router = Router()

router.get(
   '/',
   validator.getAllChannels,
   loggedIn({ populateUser: false }),
   getAllChannels
)
router.get(
   '/:id',
   validator.getChannel,
   loggedIn({ populateUser: false }),
   getChannel
)
router.post('/', validator.createChannel, loggedIn(), createChannel)
router.patch('/:id', validator.updateChannel, loggedIn(), updateChannel)
router.delete('/:id', validator.deleteChannel, loggedIn(), deleteChannel)

module.exports = router
