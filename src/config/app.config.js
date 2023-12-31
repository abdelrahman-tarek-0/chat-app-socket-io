const os = require('os')
const _path = require('path')
require('dotenv').config({
   path: _path.join(__dirname, '../../.env'),
})
const APP = require('../../package.json')

const localIp =
   os.networkInterfaces().Ethernet?.filter((ip) => ip.family === 'IPv4')[0]
      .address ||
   os.networkInterfaces().eth0?.filter((ip) => ip.family === 'IPv4')[0].address

module.exports = {
   env: process.env.NODE_ENV || 'development',
   port: Number(process.env.PORT) || 3000,
   localIp: `http://${localIp}:${Number(process.env.PORT) || 3000}`,
   localHost: `http://127.0.0.1:${Number(process.env.PORT) || 3000}`,
   db: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      poolMin: Number(process.env.DB_POOL_MIN) || 2,
      poolMax: Number(process.env.DB_POOL_MAX) || 10,
      ssl: process.env.DB_SSL === 'true',
   },
   security: {
      tokenSecret: process.env.TOKEN_SECRET,
      tokenExpires: process.env.TOKEN_EXPIRE,
      refReshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
      refReshTokenExpires: process.env.REFRESH_TOKEN_EXPIRE,
      cookieTokenExpires: () =>
         new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRE_IN_H) * 60 * 60 * 1000
         ),
      cookieRefreshTokenExpires: () =>
         new Date(
            Date.now() +
               Number(process.env.REFRESH_COOKIE_EXPIRE_IN_D) *
                  24 *
                  60 *
                  60 *
                  1000
         ),

      bcryptSalt: Number(process.env.BCRYPT_SALT),
      resetExpires: () =>
         new Date(
            Date.now() + Number(process.env.RESET_EXPIRE_IN_M) * 60 * 1000
         ),
   },
   mailDev: {
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
   },
   APP: {
      name: APP.name,
      version: APP.version,
      description: APP.description,
   },
}
