const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { safeUser } = require('../utils/safeModel')
const { randomString, randomNumber } = require('../utils/general.utils')
const { security } = require('../../config/app.config')
const ErrorBuilder = require('../utils/ErrorBuilder')

class User {
   static async signup(data, opts = { unsafePass: {} }) {
      const tokenizer = randomString(8)
      const password = await hashPassword(data.password)

      const user = await db('users')
         .insert({
            ...data,
            tokenizer,
            password,
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
      type = type?.toLowerCase()

      if (type !== 'code' && type !== 'token_link')
         throw new ErrorBuilder('Invalid type', 400, 'INVALID_TYPE')

      const reset = type === 'code' ? randomNumber(6) : randomString(64)
      const userId = db.raw('(SELECT id FROM users WHERE email = ? LIMIT 1)', [
         email,
      ])

      await db('verifications')
         .update({
            status: 'expired',
            updated_at: db.fn.now(),
         })
         .where({
            user_id: userId,
            verification_for: verificationFor,
            status: 'active',
         })

      // this must have a custom error handler
      const verification = await db('verifications')
         .insert({
            user_id: userId,
            reset,
            reset_type: type,
            verification_for: verificationFor,
            expires_at: security.resetExpires(),
         })
         .returning('*')

      // TODO: do NOT forget to handel error differently from any other database error
      return verification[0]
   }
   static async #getVerification({ id, token, verificationFor }) {
      const verification = await db('verifications')
         .select('*')
         .where({
            user_id: id,
            reset: token,
            verification_for: verificationFor,
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

      return verification
   }

   static async confirmEmail({ token, id }, opts = { unsafePass: {} }) {
      const verification = await this.#getVerification({
         id,
         token,
         verificationFor: 'confirm_email',
      })

      let user = db('users')
         .update({
            email_verified: true,
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })
         .returning('*')

      const task = db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })

      ;[user] = await Promise.all([user, task])
      return safeUser(user[0] || {}, opts?.unsafePass || {})
   }

   static async changeEmail(
      { token, id, newEmail },
      opts = { unsafePass: {} }
   ) {
      const verification = await this.#getVerification({
         id,
         token,
         verificationFor: 'change_email',
      })
      const tokenizer = randomString(8)

      let user = db('users')
         .update({
            email: newEmail,
            email_verified: false,
            tokenizer,
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })
         .returning('*')

      const task = db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })

      ;[user] = await Promise.all([user, task])
      return safeUser(user[0] || {}, opts?.unsafePass || {})
   }

   static async resetPassword(
      { token, id, password },
      opts = { unsafePass: {} }
   ) {
      const verification = this.#getVerification({
         id,
         token,
         verificationFor: 'reset_password',
      })

      password = await hashPassword(password)
      const tokenizer = randomString(8)

      let user = db('users')
         .update({
            password,
            last_password_change_at: db.fn.now(),
            tokenizer,
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })
         .returning('*')

      const task = db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })

      ;[user] = await Promise.all([user, task])
      return safeUser(user[0] || {}, opts?.unsafePass || {})
   }
}

module.exports = User
