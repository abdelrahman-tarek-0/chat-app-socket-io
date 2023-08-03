const db = require('../../config/database/db')

class User {
   static async create({ name, email, password, image_url, phone_number }) {
      const tokenizer = Math.random().toString(36).substring(2, 10)

      const user_id = await db('users')
         .insert({
            name,
            email,
            password,
            image_url,
            phone_number,
            tokenizer,
         })
         .returning('id')

      return {
         user: {
            id: user_id[0].id,
            name,
            email,
            image_url,
            phone_number,
         },
         tokenizer,
      }
   }
}

module.exports = User
