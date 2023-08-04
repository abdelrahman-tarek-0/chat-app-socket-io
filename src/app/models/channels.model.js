const db = require('../../config/database/db')

class Channel {
   static async getChannelMetadata(channelId, creatorId) {
      if (!channelId) return null

      const channel = await db('channels')
         .select(
            'id',
            'name',
            'description',
            'image_url',
            'status',
            'type',
            'creator',
            'created_at'
         )
         .where('id', channelId)
         .andWhere(function () {
            this.where('type', 'public').orWhere(function () {
               this.where('type', 'private').andWhere('creator', creatorId)
            })
         })
         .first()

      return channel
   }
}

module.exports = Channel
