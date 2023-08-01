const os = require('os')

const localIp =
   os.networkInterfaces().Ethernet?.filter((ip) => ip.family === 'IPv4')[0]
      .address ||
   os.networkInterfaces().eth0?.filter((ip) => ip.family === 'IPv4')[0].address

module.exports = {
   port: 3000,
   localIp: `http://${localIp}:${this.port || 3000}`,
   localHost: `http://127.0.0.1:${this.port || 3000}`,
}
