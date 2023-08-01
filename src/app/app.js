const _path = require('path')

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.use(express.static(_path.join(__dirname, '..', 'public')))

app.get('/', (req, res) => {
   res.sendFile(_path.join(__dirname, '..', 'public', 'pages', 'index.html'))
})

module.exports = app