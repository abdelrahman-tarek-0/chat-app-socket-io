const db = require('../../config/database/db')

class Channel {
   static async getChannel(channelId, creatorId) {
      if (!channelId) return null

      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'name', creator.name, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_agg(json_build_object('id', members.user_id, 'role', members.role, 'name', users.name, 'bio', users.bio, 'image_url', users.image_url)) as members`
            )
         )
         .leftJoin('users as creator', 'creator.id', 'channels.creator')
         .leftJoin(
            'channel_members as members',
            'channels.id',
            'members.channel_id'
         )
         .leftJoin('users', 'users.id', 'members.user_id')
         .where('channels.id', channelId)
         .andWhere('channels.status', 'active')
         .andWhere(function () {
            this.where('channels.type', 'public').orWhere(function () {
               this.where('channels.type', 'private').andWhere(
                  'channels.creator',
                  creatorId
               )
            })
         })
         .groupBy('channels.id', 'creator.id')
         .first()

      return channel
   }
   static async getAllChannels(creatorId) {
      const channels = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'name', creator.name, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_agg(json_build_object('id', members.user_id, 'role', members.role, 'name', users.name, 'bio', users.bio, 'image_url', users.image_url)) as members`
            )
         )
         .leftJoin('users as creator', 'creator.id', 'channels.creator')
         .leftJoin(
            'channel_members as members',
            'channels.id',
            'members.channel_id'
         )
         .leftJoin('users', 'users.id', 'members.user_id')
         .where('channels.status', 'active')
         .andWhere(function () {
            this.where('channels.type', 'public').orWhere(function () {
               this.where('channels.type', 'private').andWhere(
                  'channels.creator',
                  creatorId
               )
            })
         })
         .groupBy('channels.id', 'creator.id')

      return channels
   }
}

module.exports = Channel
