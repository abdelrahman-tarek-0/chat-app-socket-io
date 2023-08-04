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
         .returning('id', 'name', 'email', 'image_url', 'phone_number')

      return user[0]
   }

   static async login(email, password) {
      const user = await db('users')
         .select('id', 'name', 'email', 'password', 'image_url', 'phone_number')
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
            'last_password_change_at',
            'role',
            'email_verified',
            'created_at'
         )
         .where({
            id,
            tokenizer,
            is_active: true,
         })
         .first()

      const tokenIssuedAt = new Date(tokenIat * 1000 || 0).getTime()
      const passwordChangedAt = new Date(
         user?.last_password_change_at || 0
      ).getTime()

      if (passwordChangedAt >= tokenIssuedAt) return null

      return { ...user, last_password_change_at: undefined }
   }

   /** NOT SAFE PLEASE VALIDATE BEFORE SEND OR USE getUserSafe */
   static async getUser(index, type) {
      const user = await db('users')
         .select('*')
         .where({
            [type]: index,
         })
         .first()

      return user
   }
}

module.exports = User
