const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { safeUser } = require('../utils/safeModel')

class User {
   static async signup(
      { username, display_name, email, password },
      opts = { unsafePass: {} }
   ) {
      const tokenizer = Math.random().toString(36).substring(2, 10)

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

      return safeUser(user[0] || [], opts?.unsafePass || {})
   }

   static async login({ email, password }, opts = { unsafePass: {} }) {
      const user = await db('users')
         .select('*')
         .where('email', '=', email)
         .andWhere('is_active', '=', 'true')
         .first()

      if (!user || !(await comparePassword(password, user.password)))
         return null

      return safeUser(user || [], opts?.unsafePass || {})
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

      return safeUser(user || [], opts?.unsafePass || {})
   }

   static async getUserProfile({ id }, opts = { unsafePass: {} }) {
      const user = await db('users as user')
         .select(
            'user.*',
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_own.id, 'name', c_own.name, 'description', c_own.description, 'image', c_own.image_url)) as "creatorOf"`
            ),
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_member.id, 'name', c_member.name, 'description', c_member.description, 'image', c_member.image_url, 'role', cm.role)) as "memberIn"`
            )
         )
         .leftJoin('channels as c_own', 'user.id', 'c_own.creator')
         .leftJoin('channel_members as cm', 'user.id', 'cm.user_id')
         .leftJoin('channels as c_member', 'cm.channel_id', 'c_member.id')
         .where('user.id', id)
         .andWhere('user.is_active', '=', 'true')
         .andWhere('c_own.is_active', '=', 'true')
         .andWhere('c_member.is_active', '=', 'true')
         .groupBy('user.id')
         .first()

      if (!user) return null
      if (!user.creatorOf?.at(0)?.id) user.creatorOf = []
      if (!user.memberIn?.at(0)?.id) user.memberIn = []

      return safeUser(user || [], opts?.unsafePass || {})
   }


}

module.exports = User
