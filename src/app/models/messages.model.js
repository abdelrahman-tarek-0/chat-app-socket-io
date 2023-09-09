const db = require('../../config/database/db')
const ErrorBuilder = require('../utils/ErrorBuilder')

class Message {
   static async getBondMessages({ bondId, userId }) {
      const data = await db.raw(
         `
          ${db('bonds as bond')
             .select('bond.id as bond_id', 'bond.user1_id', 'bond.user2_id')
             .where('bond.id', '=', bondId)
             .andWhere(function () {
                this.where('user1_id', userId)
                this.orWhere('user2_id', userId)
             })
             .andWhere('status', '=', 'active')
             .toString()};

            ${db('bonds_messages as bm')
               .select(
                  'message.id as id',
                  db.raw(
                     `
                  CASE
                     WHEN message.sender_id = ? THEN 'sent'
                     ELSE 'received'
                  END as type
               `,
                     [userId]
                  ),
                  db.raw(`
                  CASE
                     WHEN message.is_active = true THEN message.content
                     ELSE null
                  END as content
               `),
                  db.raw(`
                  json_build_object(
                     'id', message.id,
                     'content',(
                        CASE
                           WHEN reply.is_active = true THEN reply.content
                           ELSE NULL
                        END
                     )
                  ) as reply_to
               `),
                  'message.sender_id as sender_id',
                  'sender.username as sender_username',
                  'sender.display_name as sender_display_name',
                  'sender.image_url as sender_image_url',
                  'bm.created_at as sent_at',
                  'message.created_at as created_at',
                  'message.updated_at as updated_at'
               )
               .leftJoin('messages as message', 'message.id', 'bm.message_id')
               .leftJoin('messages as reply', 'reply.id', 'message.reply_to')
               .leftJoin('users as sender', function () {
                  this.on('sender.id', '=', 'message.sender_id')
                  this.on('sender.is_active', '=', db.raw('?', ['true']))
               })
               .where('bm.bond_id', '=', bondId)
               .orderBy('bm.created_at', 'desc')
               .limit(50)
               .toString()}  
         `
      )

      const bond = data?.[0]?.rows?.[0]
      const messages = data?.[1]?.rows

      if (!bond?.bond_id) {
         throw new ErrorBuilder(
            'Bond not found or inactive',
            404,
            'BOND_NOT_FOUND'
         )
      }

      return messages
   }
}

module.exports = Message
