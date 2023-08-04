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
         .returning(['id', 'name','bio', 'email', 'image_url', 'phone_number'])

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
            'phone_number'
         )
         .where('email', '=', email)
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

      if (passwordChangedAt >= tokenIssuedAt) return null

      return { ...user, last_password_change_at: undefined }
   }

}

module.exports = User
