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
      if (type !== 'code' && type !== 'token_link')
         throw new ErrorBuilder('Invalid type', 400, 'INVALID_TYPE')

      const reset = type === 'code' ? randomNumber(6) : randomString(64)
      
   
      const updateVerifications = db('verifications')
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
      const verification = db('verifications')
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

      const [verifications] = await Promise.all([
         verification,
         updateVerifications,
      ])

      if (!verifications?.at(0)?.id) throw new Error('Something went wrong')

      // TODO: do NOT forget to handel error differently from any other database error
      return verifications[0] 
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

      const task = db('users')
         .update({
            email_verified: true,
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })

      const task2 = db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })

      await Promise.all([task, task2])
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

      const task =  db('users')
         .update({
            password,
            last_password_change_at: db.fn.now(),
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.user_id,
            is_active: db.raw('true'),
         })

      const task2 = db('verifications')
         .update({
            status: 'used',
            updated_at: db.fn.now(),
         })
         .where({
            id: verification.id,
         })
      
      await Promise.all([task, task2])
   }
}

module.exports = User
