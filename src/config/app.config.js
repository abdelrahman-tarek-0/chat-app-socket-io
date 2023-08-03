const os = require('os')
require('dotenv').config()

const localIp =
   os.networkInterfaces().Ethernet?.filter((ip) => ip.family === 'IPv4')[0]
      .address ||
   os.networkInterfaces().eth0?.filter((ip) => ip.family === 'IPv4')[0].address;

module.exports = {
   port: Number(process.env.PORT) || 3000,
   localIp: `http://${localIp}:${this.port || 3000}`,
   localHost: `http://127.0.0.1:${this.port || 3000}`,
   db: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      poolMin: Number(process.env.DB_POOL_MIN) || 2,
      poolMax: Number(process.env.DB_POOL_MAX) || 10,
   },
   security: {
      tokenSecret: process.env.JWT_SECRET,
      tokenExpires: process.env.JWT_EXPIRE,
   },
}
