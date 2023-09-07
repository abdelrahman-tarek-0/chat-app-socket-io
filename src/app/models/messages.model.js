const db = require('../../config/database/db')
const ErrorBuilder = require('../utils/ErrorBuilder')

class Message {
   static async getBondMessages({ bondId, userId }) {

      let data = db('bonds as bond')
         .select('bond.id as bond_id', 'bond.user1_id', 'bond.user2_id')
         .where('bond.id', '=', bondId)
         .andWhere(function () {
            this.where('user1_id', userId)
            this.orWhere('user2_id', userId)
         })
         .andWhere('status', '=', 'active')
    

      data = data
         .select(
            db.raw(
               `json_agg(
                  (json_build_object(
                     'id', message.id,
                     'content', 
                        (CASE
                              WHEN message.is_active = true THEN message.content
                              ELSE NULL
                        END)
                     ,
                     'sender_id', message.sender_id,
                     'sender_username', sender.username,
                     'sender_image', sender.image_url,
                     'reply_to', json_build_object(
                           'id', reply.id,
                           'content', (
                                 CASE
                                    WHEN reply.is_active = true THEN reply.content
                                    ELSE NULL
                                 END
                           )
                        ),
                     'sent_at', bonds_messages.created_at,
                     'message_created_at', message.created_at
                  )) order by message.created_at ASC
                  
               )  as "messages"
           `
            )
         )
         .leftJoin('bonds_messages', 'bond_id', 'bond.id')
         .leftJoin('messages as message', 'message.id', 'bonds_messages.message_id')
         .leftJoin('messages as reply', 'reply.id', 'message.reply_to')
         .leftJoin('users as sender', function () {
            this.on('sender.id', '=', 'message.sender_id')
            this.on('sender.is_active', '=', db.raw('?', ['true']))
         })
         

      data = await data.groupBy('bond.id', 'sender.id')

      if (data.length === 0) {
         throw new ErrorBuilder('Bond not found', 404, 'BOND_NOT_FOUND')
      }  

      return data
   }
}



module.exports = Message
