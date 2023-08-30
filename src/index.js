const { port, localIp, localHost } = require('./config/app.config')

process.on('uncaughtException', (err) => {
   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
   console.log(err)
   // process.exit(1)
})

const app = require('./app/app')

const server = app.listen(port, () => {
   const locally = `locally on ${localHost}`
   const onNetwork = `the network on ${localIp}`
   console.log(`server is running \n${locally}\n${onNetwork}`)
})

process.on('unhandledRejection', (err) => {
   console.log('UNHANDLED REJECTION! 💥 Shutting down...')
   console.log(err)
   // server.close(() => {
   //    process.exit(1)
   // })
})
