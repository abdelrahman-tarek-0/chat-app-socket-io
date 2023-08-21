const { Router } = require('express')
const authRoutes = require('./APIs/auth.routes')
const channelsRoutes = require('./APIs/channels.routes')
const usersRoutes = require('./APIs/users.routes')
const channelsUsersRoutes = require('./APIs/channels-users.routes')

const { loggedIn } = require('../middlewares/auth.middleware')

const router = Router()

router.get('/', loggedIn(), (req, res) => {
   res.json({
      status: 'success',
      data: {
         user: req.user,
      },
   })
})

router.use('/auth', authRoutes)
router.use('/channels', channelsRoutes)
router.use('/users', usersRoutes)
router.use('/channels-users', channelsUsersRoutes)

module.exports = router
