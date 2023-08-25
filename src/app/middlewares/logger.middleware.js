const textColors = (text, color = 'White') => {
   const colors = {
      Black: '\x1b[30m',
      Red: '\x1b[31m',
      Green: '\x1b[32m',
      Yellow: '\x1b[33m',
      Blue: '\x1b[34m',
      Magenta: '\x1b[35m',
      Cyan: '\x1b[36m',
      White: '\x1b[37m',
   }
   color = colors[color]
   return `${color}${text}\x1b[0m`
}

const now = (unit) => {
   const hrTime = process.hrtime()
   switch (unit) {
      case 'millie':
         return hrTime[0] * 1000 + hrTime[1] / 1000000
      case 'micro':
         return hrTime[0] * 1000000 + hrTime[1] / 1000
      case 'nano':
         return hrTime[0] * 1000000000 + hrTime[1]
      case 'second':
         return hrTime[0] + hrTime[1] / 1000000000
      case 'minute':
         return (hrTime[0] + hrTime[1] / 1000000000) / 60
      case 'hour':
         return (hrTime[0] + hrTime[1] / 1000000000) / 3600
      case 'day':
         return (hrTime[0] + hrTime[1] / 1000000000) / 86400
      default:
         return hrTime[0] * 1000000000 + hrTime[1]
   }
}

const colorMethodMap = {
   GET: 'Green',
   POST: 'Yellow',
   DELETE: 'Red',
}

/**
 * @description function logger to log the request and response with the time it took to process the request
 * @returns  {function}  the logger function
 */
const logger = () => (req, res, next) => {
   console.log('req.body: ', req.body)
   const start = now('millie')
   res.once('finish', () => {
      const finish = now('millie')
      const took = (finish - start).toFixed(3)
      console.log(
         `${textColors(req.method, colorMethodMap[req.method])} ${textColors(
            req.originalUrl,
            'Cyan'
         )} ${textColors(
            res.statusCode,
            res.statusCode >= 200 && res.statusCode < 400 ? 'Green' : 'Red'
         )} from ${textColors(req.ip, 'Red')} Toke ${textColors(
            `${took} ms`,
            'Yellow'
         )} ${req.headers.origin || ''}`
      )
   })
   return next()
}

module.exports = logger
