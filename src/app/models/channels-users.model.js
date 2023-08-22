const db = require('../../config/database/db')

const { randomString } = require('../utils/general.utils')

const ErrorBuilder = require('../utils/ErrorBuilder')

// TODO: this model is very bad, it needs to be refactored and optimized
class ChannelUser {
   static async createGeneralInvite(channelId, userId) {
      console.log('userId: ', userId)
      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'display_name', creator.display_name,'username', creator.username, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_build_object('id', member.user_id, 'role', member.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url) as member`
            )
         )

         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channel_members as member', function () {
            this.on('member.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(
                  db.raw(
                     `(select id from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw(`?`, userId)
               )
         })
         .leftJoin('users', 'users.id', 'member.user_id')

         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')

         .andWhere('creator.is_active', '=', 'true')
         .groupBy(
            'channels.id',
            'creator.id',
            'member.user_id',
            'member.role',
            'users.display_name',
            'users.username',
            'users.bio',
            'users.image_url'
         )
         .first()

      if (!channel)
         throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
      if (!channel?.member?.id) channel.member = {}
      if (!channel?.creator?.id) channel.creator = {}

      console.log('channel: ', channel)

      let inviter
      if (channel.creator?.id === userId) {
         inviter = channel.creator
         inviter.role = 'admin'
      } else if (channel.member?.id === userId) {
         inviter = channel.member
      } else {
         inviter = null
      }

      const isAuth =
         channel.type === 'public' ? true : inviter?.role === 'admin'

      if (!inviter)
         throw new ErrorBuilder(
            `Inviter is not in the channel '${channel.name}'`,
            400,
            'USER_NOT_EXISTS'
         )
      if (!isAuth)
         throw new ErrorBuilder(
            'You are not authorized to send invite',
            400,
            'NOT_AUTHORIZED'
         )

      const invite = await db('channel_invites')
         .select('*')
         .where({
            channel_id: channelId,
            creator_id: userId,
            type: 'general',
         })
         .first()

      if (invite?.id && new Date(invite?.expires_at) > new Date()) return invite

      let task
      if (invite?.id)
         task = db('channel_invites').delete().where({ id: invite.id })

      let newInvite = db('channel_invites')
         .insert({
            channel_id: channelId,
            creator_id: userId,
            type: 'general',
            expires_at: new Date(Date.now() + 1000 * 60 * 60),
            alias: randomString(10),
         })
         .returning('*')

      if (task) [newInvite] = await Promise.all([newInvite, task])
      else newInvite = await newInvite

      return newInvite[0]
   }

   static async createDirectInvite(channelId, userId, targetUsername) {
      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'display_name', creator.display_name,'username', creator.username, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_agg(json_build_object('id', members.user_id, 'role', members.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url)) as members`
            )
         )
         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channel_members as members', function () {
            this.on('members.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = members.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(function () {
                  this.on(
                     db.raw(
                        `(select id from users where users.id = members.user_id limit 1)`
                     ),
                     '=',
                     db.raw(`?`, userId)
                  ).orOn(
                     db.raw(
                        `(select username from users where users.id = members.user_id limit 1)`
                     ),
                     '=',
                     db.raw(`?`, targetUsername)
                  )
               })
         })
         .leftJoin('users', 'users.id', 'members.user_id')
         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')
         .andWhere('creator.is_active', '=', 'true')
         .groupBy('channels.id', 'creator.id')
         .first()

      if (!channel)
         throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
      if (!channel?.members?.at(0)?.id) channel.members = []
      if (!channel?.creator?.id) channel.creator = {}

      let inviter = channel?.members?.find((m) => m.id === userId)
      if (inviter) {
      } else if (channel.creator.id === userId) {
         inviter = channel.creator
         inviter.role = 'admin'
      } else {
         inviter = null
      }
      let invited = channel.members.find((m) => m.username === targetUsername)
      const isAuth =
         channel.type === 'public' ? true : inviter?.role === 'admin'

      if (invited?.id)
         throw new ErrorBuilder('User already in channel', 400, 'USER_EXISTS')
      if (!inviter)
         throw new ErrorBuilder(
            'Inviter not in channel',
            400,
            'USER_NOT_EXISTS'
         )
      if (!isAuth)
         throw new ErrorBuilder(
            'You are not authorized to send invite',
            400,
            'NOT_AUTHORIZED'
         )

      invited = await db('users')
         .select('*')
         .where('username', targetUsername)
         .first()

      if (!invited?.id)
         throw new ErrorBuilder('Invited user not found', 404, 'NOT_FOUND')

      const invite = await db('channel_invites')
         .select('*')
         .where({
            channel_id: channelId,
            creator_id: userId,
            target_id: invited.id,
            type: 'directed',
         })
         .first()

      if (invite?.id && new Date(invite?.expires_at) > new Date())
         return {
            invite,
            channel,
            invited,
         }

      let task
      if (invite?.id)
         task = db('channel_invites').delete().where({ id: invite.id })

      let newInvite = db('channel_invites')
         .insert({
            channel_id: channelId,
            creator_id: userId,
            target_id: invited.id,
            type: 'directed',
            expires_at: new Date(Date.now() + 1000 * 60 * 60),
            alias: randomString(10),
         })
         .returning('*')

      if (task) [newInvite] = await Promise.all([newInvite, task])
      else newInvite = await newInvite

      return {
         invite: newInvite[0],
         channel,
         invited,
      }
   }

   static async acceptInvite(alias, userId) {
      const invite = await db('channel_invites')
         .select(
            'channel_invites.id as id',
            'channel_invites.type as invType',
            'channels.creator as creator',
            'channels.id as channel_id',
            db.raw(
               `json_build_object('id', member.user_id, 'role', member.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url) as member`
            )
         )
         .leftJoin('channels', 'channels.id', 'channel_invites.channel_id')
         .leftJoin('channel_members as member', function () {
            this.on('member.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select id from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw(`?`, userId)
               )
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
         })
         .leftJoin('users', 'users.id', 'member.user_id')
         .where('channel_invites.alias', alias)
         .andWhere('channel_invites.expires_at', '>', db.fn.now())
         .andWhere('channels.is_active', true)
         .andWhere(function () {
            this.where('channels.type', 'public').orWhere(
               'channel_invites.target_id',
               userId
            )
         })
         .first()
    

      if (!invite?.id)
         throw new ErrorBuilder(`Invite expired or not found`, 400, 'NOT_FOUND')

      const isMember = invite?.member?.id

      if (isMember || invite?.creator === userId) return invite

      let task;
      if (invite.invType === 'directed') {
         if (invite.target_id !== userId)
            throw new ErrorBuilder(
               `You are not authorized to accept this invite`,
               400,
               'NOT_AUTHORIZED'
            )

         task =  db('channel_invites').delete().where({ id: invite.id })
      }

      let member = db('channel_members')
         .insert({
            channel_id: invite.channel_id,
            user_id: userId,
         })
         .returning('*')

      if (task) [member] = await Promise.all([member, task])
      else member = await member

      return member[0]
   }

   static async joinChannel(channelId, userId) {
      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'display_name', creator.display_name,'username', creator.username, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_build_object('id', member.user_id, 'role', member.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url) as member`
            )
         )
         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channel_members as member', function () {
            this.on('member.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(
                  db.raw(
                     `(select id from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw(`?`, userId)
               )
         })
         .leftJoin('users', 'users.id', 'member.user_id')

         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')

         .andWhere('creator.is_active', '=', 'true')
         .groupBy(
            'channels.id',
            'creator.id',
            'member.user_id',
            'member.role',
            'users.display_name',
            'users.username',
            'users.bio',
            'users.image_url'
         )
         .first()

      if (!channel || channel?.type === 'private')
         throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
      if (!channel?.member?.id) channel.member = {}
      if (!channel?.creator?.id) channel.creator = {}

      if (channel?.member?.id === userId || channel?.creator?.id === userId)
         return channel

      await db('channel_members').insert({
         channel_id: channelId,
         user_id: userId,
      })

      return channel
   }

   static async leaveChannel(channelId, userId) {
      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'display_name', creator.display_name,'username', creator.username, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_build_object('id', member.user_id, 'role', member.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url) as member`
            )
         )
         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channel_members as member', function () {
            this.on('member.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(
                  db.raw(
                     `(select id from users where users.id = member.user_id limit 1)`
                  ),
                  '=',
                  db.raw(`?`, userId)
               )
         })
         .leftJoin('users', 'users.id', 'member.user_id')

         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')

         .andWhere('creator.is_active', '=', 'true')
         .groupBy(
            'channels.id',
            'creator.id',
            'member.user_id',
            'member.role',
            'users.display_name',
            'users.username',
            'users.bio',
            'users.image_url'
         )
         .first()

      if (!channel)
         throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
      if (!channel?.member?.id) channel.member = {}
      if (!channel?.creator?.id) channel.creator = {}

      if (channel.creator.id === userId)
         throw new ErrorBuilder(
            'Creator cannot leave channel',
            400,
            'NOT_AUTHORIZED'
         )

      if (channel.member.id !== userId)
         throw new ErrorBuilder(
            'You are not in this channel',
            400,
            'NOT_AUTHORIZED'
         )

      await db('channel_members').delete().where({
         channel_id: channelId,
         user_id: userId,
      })
   }

   static async kickUser(channelId, userId, targetId) {
      const channel = await db('channels')
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            'channels.type',
            db.raw(
               `json_build_object('id', creator.id, 'display_name', creator.display_name,'username', creator.username, 'bio', creator.bio, 'image_url', creator.image_url) as creator`
            ),
            db.raw(
               `json_agg(json_build_object('id', members.user_id, 'role', members.role, 'display_name', users.display_name, 'username', users.username, 'bio', users.bio, 'image_url', users.image_url)) as members`
            )
         )
         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channel_members as members', function () {
            this.on('members.channel_id', '=', 'channels.id')
               .andOn(
                  db.raw(
                     `(select is_active from users where users.id = members.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(function () {
                  this.on(
                     db.raw(
                        `(select id from users where users.id = members.user_id limit 1)`
                     ),
                     '=',
                     db.raw(`?`, userId)
                  ).orOn(
                     db.raw(
                        `(select id from users where users.id = members.user_id limit 1)`
                     ),
                     '=',
                     db.raw(`?`, targetId)
                  )
               })
         })
         .leftJoin('users', 'users.id', 'members.user_id')
         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')
         .andWhere('creator.is_active', '=', 'true')
         .groupBy('channels.id', 'creator.id')
         .first()

      if (!channel)
         throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
      if (!channel?.members?.at(0)?.id) channel.members = []
      if (!channel?.creator?.id) channel.creator = {}

      let admin = channel?.members?.find((m) => m.id === userId)
      if (admin) {
      } else if (channel.creator.id === userId) {
         admin = channel.creator
         admin.role = 'admin'
      } else {
         admin = null
      }

      if (admin?.role !== 'admin')
         throw new ErrorBuilder(
            'You are not authorized to kick user',
            400,
            'NOT_AUTHORIZED'
         )

      let kickedUser = channel.members.find((m) => m.id === targetId)
         if(kickedUser){
         }else if(channel.creator.id === targetId){
            kickedUser = channel.creator
            kickedUser.role = 'admin'
         }else{
            throw new ErrorBuilder('User not in the channel', 404, 'NOT_FOUND')
         }

      if (kickedUser?.role === 'admin')
         throw new ErrorBuilder(
            'You cannot kick an admin',
            400,
            'NOT_AUTHORIZED'
         )
      
      if (kickedUser?.id === userId)
         throw new ErrorBuilder(
            'You cannot kick yourself',
            400,
            'NOT_AUTHORIZED'
         )

      await db('channel_members').delete().where({
         channel_id: channelId,
         user_id: targetId,
      })
   }
}

module.exports = ChannelUser
