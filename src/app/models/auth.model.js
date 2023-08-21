const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { safeUser } = require('../utils/safeModel')
const { randomString, randomNumber } = require('../utils/general.utils')
const { security } = require('../../config/app.config')
const ErrorBuilder = require('../utils/ErrorBuilder')

class User {
   static async signup(
      { username, displayName, email, password },
      opts = { unsafePass: {} }
   ) {
      const tokenizer = randomString(8)
      password = await hashPassword(password)
      const user = await db('users')
         .insert({
            username,
            display_name: displayName,
            email: email.toLowerCase(),
            password,
            tokenizer,
         })
         .returning('*')

      return safeUser(user[0] || {}, opts?.unsafePass || {})
   }

   static async login({ email, password }, opts = { unsafePass: {} }) {
      const user = await db('users')
         .select('*')
         .where({
            email,
            is_active: db.raw('true'),
         })
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
         .where({
            id,
            tokenizer,
            is_active: db.raw('true'),
         })
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
      if (type !== 'code' && type !== 'token_link')
         throw new ErrorBuilder('Invalid type', 400, 'INVALID_TYPE')

      const reset = type === 'code' ? randomNumber(6) : randomString(64)

      const user = await db('users')
         .select('*')
         .where({
            email,
            is_active: db.raw('true'),
         })
         .first()

      if (!user?.id)
         throw new ErrorBuilder('Invalid email', 400, 'INVALID_EMAIL')

      await db('verifications')
         .update({
            status: 'expired',
            updated_at: db.fn.now(),
         })
         .where({
            user_id: user.id,
            verification_for: verificationFor,
            status: 'active',
         })

      const verification = await db('verifications')
         .insert({
            user_id: user.id,
            reset,
            reset_type: type?.toLowerCase() === 'code' ? 'code' : 'token_link',
            verification_for: verificationFor,
            expires_at: security.resetExpires(),
         })
         .returning('*')

      if (!verification?.at(0)?.id) throw new Error('Something went wrong')

      // TODO: do NOT forget to handel error differently from any other database error
      return { verification: verification[0], user }
   }

   static async confirmEmail({ token, id }) {
      const verification = await db('verifications')
         .select('*')
         .where({
            user_id: id,
            reset: token,
            verification_for: 'confirm_email',
            status: 'active',
         })
         .first()

      if (!verification?.id)
         throw new ErrorBuilder(
            'Invalid or Already Used Token Please Try Again Later',
            400,
            'INVALID'
         )

      if (verification?.expires_at < new Date().getTime())
         throw new ErrorBuilder('Expired', 400, 'EXPIRED')

      await db('users')
         .update({
            email_verified: true,
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })

      await db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })
   }

   static async resetPassword({ token, id, password }) {
      const verification = await db('verifications')
         .select('*')
         .where({
            user_id: id,
            reset: token,
            verification_for: 'reset_password',
            status: 'active',
         })
         .first()

      if (!verification?.id)
         throw new ErrorBuilder(
            'Invalid or Already Used token Please Try Again Later',
            400,
            'INVALID'
         )

      if (verification?.expires_at < new Date().getTime())
         throw new ErrorBuilder('Expired', 400, 'EXPIRED')

      password = await hashPassword(password)

      await db('users')
         .update({
            password,
            last_password_change_at: db.fn.now(),
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })

      await db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })
   }
}

module.exports = User
