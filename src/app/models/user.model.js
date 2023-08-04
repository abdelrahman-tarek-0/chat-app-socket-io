const db = require('../../config/database/db')
const { hashPassword,comparePassword } = require('../utils/passwordHash')

class User {
   static async signup({ name, email, password, image_url, phone_number }) {
      const tokenizer = Math.random().toString(36).substring(2, 10)

      password = await hashPassword(password);
      const user = await db('users')
         .insert({
            name,
            email,
            password,
            image_url,
            phone_number,
            tokenizer,
         })
         .returning('*')

      return user[0]
   }
   static async login(email, password) {
      const user = await db('users')
         .select('*')
         .where('email', '=', email)
         .first()

      if (!user || !(await comparePassword(password, user.password))) return null
      
      return user
   }

   /** NOT SAFE PLEASE VALIDATE BEFORE SEND */ 
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
