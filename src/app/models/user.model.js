const db = require('../../config/database/db')

class User {
   static async signup({ name, email, password, image_url, phone_number }) {
      const tokenizer = Math.random().toString(36).substring(2, 10)

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
         .andWhere('password', '=', password)
         .first()

      return user
   }

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
