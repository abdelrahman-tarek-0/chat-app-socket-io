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

router.get('/', loggedIn(), getAllChannels)
router.get('/:id', validator.getChannel, loggedIn(), getChannel)
router.post('/', loggedIn(), createChannel)
router.patch('/:id', loggedIn(), updateChannel)
router.delete('/:id', loggedIn(), deleteChannel)
 
module.exports = router
