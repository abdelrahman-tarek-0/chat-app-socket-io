const _path = require('path')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const logger = require('./middlewares/logger.middleware')

const apiRouter = require('./routes/index.routes')
const viewsRouter = require('./routes/views.routes')

const app = express()

app.use((_req, res, next) => {
   res.header('Access-Control-Allow-Credentials', true)
   next()
})
app.use(
   cors({
      origin: 'http://localhost:5500',
   })
)

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))
app.use(cookieParser())

app.use(express.static(_path.join(__dirname, '..', 'public')))

app.use(logger())

app.use('/api/v1', apiRouter)
app.use('/', viewsRouter)

app.use((err, _req, res, _next) => {
   res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      stack: err.stack.split('\n').map((line) => line.trim()),
      errObj: err,
   })
})
app.use((req, res) => {
   res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`,
   })
})

// TODO
// replaying to message with a message in chat
// mentioning a user in chat using discord's mention syntax, content: "hello <@{{USER_ID}}> how are you?"
// Rich Text editor
// OAuth2
// response builder
// add yo user a 'display name' and 'username' fields one for the user to see and the other for the user to use to invite other users to the channels
// maybe use redis
// add a 'last seen'
// user have limit to create 5 channels max
// i am thinking of migrating to ts with mongodb as the database (i am not sure yet)
// use validation (make sure uuid valid check)
// users must request to enter a public channel and the owner or the admin of the channel must accept the request
// channel have a display name and a channel_name
// is email case sensitive ? no
// who can change the channel info ? (only the owner for now)
// when user send image must check if the image is valid not just the extension (if the image is link or buffer)
// maybe make the role system like discord
// search channel by unique name
// end to end encryption
// request account deletion via email the current version is just disabling the account and not deleting it

// user ca join a public channel without any invitation
// in case of a private channel the user must have an invitation to join the channel, the invite created by admin or owner
// i will change the behavior of the public channel after adding a (channel_settings, request_join) tables, in the near future
module.exports = app
