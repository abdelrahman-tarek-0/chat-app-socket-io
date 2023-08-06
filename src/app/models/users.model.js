const db = require('../../config/database/db')
const { hashPassword, comparePassword } = require('../utils/passwordHash')

class User {
   static async signup({ name, email, password }) {
      const tokenizer = Math.random().toString(36).substring(2, 10)

      password = await hashPassword(password)
      const user = await db('users')
         .insert({
            name,
            email,
            password,
            tokenizer,
         })
         .returning([
            'id',
            'name',
            'bio',
            'email',
            'image_url',
            'phone_number',
            'tokenizer',
         ])

      return user[0]
   }

   static async login(email, password) {
      const user = await db('users')
         .select(
            'id',
            'name',
            'bio',
            'email',
            'password',
            'image_url',
            'phone_number',
            'tokenizer'
         )
         .where('email', '=', email)
         .where('is_active', '=', 'true')
         .first()

      if (!user || !(await comparePassword(password, user.password)))
         return null

      return { ...user, password: undefined }
   }

   static async getUserSafe(id, tokenizer, tokenIat) {
      const user = await db('users')
         .select(
            'id',
            'name',
            'email',
            'email_verified',
            'image_url',
            'phone_number',
            'bio',
            'last_password_change_at',
            'role',
            'email_verified',
            'created_at'
         )
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

      return { ...user, last_password_change_at: undefined }
   }

   static async getUserProfile(id) {
      const user = await db('users as user')
         .select(
            'user.id',
            'user.name',
            'user.email',
            'user.image_url',
            'user.role',
            'user.bio',
            'user.created_at',
            'user.updated_at',
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_own.id, 'name', c_own.name, 'description', c_own.description, 'image', c_own.image_url)) as creatorOf`
            ),
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_member.id, 'name', c_member.name, 'description', c_member.description, 'image', c_member.image_url, 'role', cm.role)) as memberIn`
            )
         )
         .leftJoin('channels as c_own', 'user.id', 'c_own.creator')
         .leftJoin('channel_members as cm', 'user.id', 'cm.user_id')
         .leftJoin('channels as c_member', 'cm.channel_id', 'c_member.id')
         .where('user.id', id)
         .groupBy('user.id')
         .first()

      if (!user) return null

      return user
   }
}

module.exports = User
