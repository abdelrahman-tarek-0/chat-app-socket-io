const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { safeUser } = require('../utils/safeModel')
const { randomString,randomNumber } = require('../utils/general.utils')

class User {
   static async signup(
      { username, display_name, email, password },
      opts = { unsafePass: {} }
   ) {
      const tokenizer = randomString(8)

      password = await hashPassword(password)
      const user = await db('users')
         .insert({
            username,
            display_name,
            email,
            password,
            tokenizer,
         })
         .returning('*')

      return safeUser(user[0] || {}, opts?.unsafePass || {})
   }

   static async login({ email, password }, opts = { unsafePass: {} }) {
      const user = await db('users')
         .select('*')
         .where('email', '=', email)
         .andWhere('is_active', '=', 'true')
         .first()

      if (!user || !(await comparePassword(password, user.password)))
         return null

      return safeUser(user || {}, opts?.unsafePass || {})
   }

   static async verifyUser(
      { id, tokenizer, tokenIat },
      opts = { unsafePass: {} }
   ) {
      const user = await db('users')
         .select('*')
         .where('id', '=', id)
         .andWhere('tokenizer', '=', tokenizer || '')
         .andWhere('is_active', '=', 'true')
         .first()

      if (!user) return null

      const tokenIssuedAt = new Date(tokenIat * 1000 || 0).getTime()
      const passwordChangedAt = new Date(
         user?.last_password_change_at || 0
      ).getTime()

      if (passwordChangedAt > tokenIssuedAt + 5000) return null

      return safeUser(user || {}, opts?.unsafePass || {})
   }
   
   static async createReset({ email, type, verificationFor }) {
      const reset = type?.toLowerCase() === 'code' ? randomNumber(6) : randomString(64)

      const user = await db('users')
         .select('*')
         .where('email', '=', email)
         .andWhere('is_active', '=', db.raw('true'))
         .first()

      if (!user?.id) return null

      await db('verifications')
         .update({
            status: 'expired',
            updated_at: db.fn.now(),
         })
         .where('user_id', '=', user.id)
         .andWhere('verification_for', '=', verificationFor)

      await db('verifications').insert({
         user_id: user.id,
         reset,
         reset_type: type?.toLowerCase() === 'code' ? 'code' : 'token_link',
         verification_for: verificationFor,
      })

      return true
   }
}

module.exports = User
