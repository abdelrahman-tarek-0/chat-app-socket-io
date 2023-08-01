const { port, localIp, localHost } = require('./config/app.config')

process.on('uncaughtException', (err) => {
   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
   console.log(err.name, err.message)
   process.exit(1)
})

// init the serve
const app = require('./app/app')

// connect to the server after the database is connected
const locally = 'locally on ' + localHost
const onNetwork = 'the network on ' + localIp

server = app.listen(port, () => {
   console.log(`server is running \n${locally}\n${onNetwork}`)
})

process.on('unhandledRejection', (err) => {
   console.log('UNHANDLED REJECTION! 💥 Shutting down...')
   console.log(err.name, err.message)
   server.close(() => {
      process.exit(1)
   })
})
