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
                  'bm.local_id as localId',
                  'message.is_active as isActive',
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
                     ELSE 'Xx This message has been deleted xX'
                  END as content
               `),
                  db.raw(`
                  json_build_object(
                     'id', reply.id,
                     'localId', (
                        CASE
                           WHEN reply_bond_message.bond_id = bm.bond_id THEN reply_bond_message.local_id
                           ELSE NULL
                        END   
                     ),
                     'isForwarded', (
                        CASE
                           WHEN reply_bond_message.bond_id != bm.bond_id THEN TRUE
                           ELSE FALSE
                        END
                     ),
                     'content',(
                        CASE
                           WHEN reply.is_active = true THEN reply.content
                           WHEN reply.is_active = false THEN 'Xx This message has been deleted xX'
                           ELSE NULL
                        END
                     ),
                     'attachments', (
                        CASE
                           WHEN (reply.is_active = true and reply.id IS NOT NULL) THEN JSON_AGG( DISTINCT
                                 jsonb_build_object(
                                    'id', reply_to_attachments.id,
                                    'type', reply_to_attachments.type,
                                    'url', reply_to_attachments.url
                                 ) 
                              )
                           ELSE NULL
                        END
                     ),
                     'isActive', reply.is_active
                  ) as reply_to
               `),
                  db.raw(`
                     CASE WHEN( message.is_active = true) THEN JSON_AGG(DISTINCT
                           jsonb_build_object(
                              'id', attachment.id,
                              'type', attachment.type,
                              'url', attachment.url
                           )
                        )  
                     ELSE NULL 
                     END as attachments
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
                  this.on('sender.id', '=', 'message.sender_id').andOn(
                     'sender.is_active',
                     '=',
                     db.raw('?', ['true'])
                  )
               })
               .leftJoin('attachments as attachment', function () {
                  this.on('attachment.message_id', '=', 'message.id').andOn(
                     'message.is_active',
                     '=',
                     db.raw('?', ['true'])
                  )
               })
               .leftJoin('attachments as reply_to_attachments', function () {
                  this.on(
                     'reply_to_attachments.message_id',
                     '=',
                     'reply.id'
                  ).andOn('reply.is_active', '=', db.raw('?', ['true']))
               })
               .leftJoin('bonds_messages as reply_bond_message', function () {
                  this.on('reply_bond_message.message_id', '=', 'reply.id')
               })
               .where('bm.bond_id', '=', bondId)
               .orderBy('bm.created_at', 'asc')
               .limit(50)
               .groupBy(
                  'message.id',
                  'reply.id',
                  'sender.id',
                  'bm.created_at',
                  'bm.local_id',
                  'reply_bond_message.local_id',
                  'reply_bond_message.bond_id',
                  'bm.bond_id'
               )
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
