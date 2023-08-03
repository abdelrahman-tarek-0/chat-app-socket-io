const _path = require('path')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const router = require('./routes/index.routes')

const app = express()

app.use(cors())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))
app.use(cookieParser())

app.use(express.static(_path.join(__dirname, '..', 'public')))

app.get('/', (req, res) => {
   res.sendFile(_path.join(__dirname, '..', 'public', 'pages', 'index.html'))
})

app.use('/api/v1', router)


// TODO
// replaying to message with a message in chat
// mentioning a user in chat using discord's mention syntax, content: "hello <@{{USER_ID}}> how are you?"
// Rich Text editor 
// OAuth2
// response builder
// add yo user a 'display name' and 'username' fields one for the user to see and the other for the user to use to invite other users to the channels
module.exports = app