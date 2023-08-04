const bcrypt = require('bcrypt')
const { security } = require('../../config/app.config')

exports.hashPassword = async (password) => {
   const hash = await bcrypt.hash(password, security.bcryptSalt)
   return hash
}

exports.comparePassword = async (password, hash) => {
   const match = await bcrypt.compare(password, hash)
   return match
}
