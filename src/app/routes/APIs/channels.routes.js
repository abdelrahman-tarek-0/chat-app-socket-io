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

router.get('/', loggedIn(), validator.getAllChannels, getAllChannels)
router.get('/:id', loggedIn(), validator.getChannel, getChannel)
router.post('/', loggedIn(), validator.createChannel, createChannel)
router.patch('/:id', loggedIn(), validator.updateChannel, updateChannel)
router.delete('/:id', loggedIn(), deleteChannel)

module.exports = router
