const _path = require('path')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.use(express.static(_path.join(__dirname, '..', 'public')))

app.get('/', (req, res) => {
   res.sendFile(_path.join(__dirname, '..', 'public', 'pages', 'index.html'))
})


// TODO
// replaying to message with a message in chat
// mentioning a user in chat using discord's mention syntax, content: "hello <@{{USER_ID}}> how are you?"
// Rich Text editor 
// OAuth2
module.exports = app