const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { safeUser } = require('../utils/safeModel')
const { randomString, randomNumber } = require('../utils/general.utils')
const { security } = require('../../config/app.config')
const ErrorBuilder = require('../utils/ErrorBuilder')
const { getVerification } = require('../helpers/auth.helpers')

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
      if (type !== 'code' && type !== 'token_link')
         throw new ErrorBuilder('Invalid type', 400, 'INVALID_TYPE')

      const reset = type === 'code' ? randomNumber(6) : randomString(64)

      await db('verifications')
         .update({
            status: 'expired',
            updated_at: db.fn.now(),
         })
         .where({
            user_id: db.raw('(SELECT id FROM users WHERE email = ? LIMIT 1)', [
               email,
            ]),
            verification_for: verificationFor,
            status: 'active',
         })

      // this must have a custom error handler
      const verification = await db('verifications')
         .insert({
            user_id: db.raw('(SELECT id FROM users WHERE email = ? LIMIT 1)', [
               email,
            ]),
            reset,
            reset_type: type?.toLowerCase() === 'code' ? 'code' : 'token_link',
            verification_for: verificationFor,
            expires_at: security.resetExpires(),
         })
         .returning('*')

      // TODO: do NOT forget to handel error differently from any other database error
      return verification[0]
   }

   static async confirmEmail({ token, id }, opts = { unsafePass: {} }) {
      const verification = await getVerification(db, {
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
      const verification = await getVerification(db, {
         id,
         token,
         verificationFor: 'change_email',
      })

      let user = db('users')
         .update({
            email: newEmail,
            email_verified: false,
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
      const verification = await getVerification(db, {
         id,
         token,
         verificationFor: 'reset_password',
      })

      password = await hashPassword(password)

      let user = db('users')
         .update({
            password,
            last_password_change_at: db.fn.now(),
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })

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
