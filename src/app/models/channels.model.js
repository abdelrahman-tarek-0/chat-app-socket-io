const db = require('../../config/database/db')

const { safeChannelUpdate, safeChannel } = require('../utils/safeModel')

const ErrorBuilder = require('../utils/ErrorBuilder')

const optsConstructor = {
   getAll: (opts) => {
      const allowOrderBy = ['id', 'name', 'type', 'members_count', 'created_at']
      console.log('opts raw: ', opts)

      if (!opts) opts = {}
      if (!opts?.order) opts.order = {}
      if (!opts?.pagination) opts.pagination = {}
      if (!opts?.search) opts.search = null

      // order: {by:'id',dir:'asc'}
      if (!opts?.order?.by || !allowOrderBy.includes(opts.order.by))
         opts.order.by = 'id'
      if (
         allowOrderBy.includes(opts.order.by) &&
         opts?.order?.by !== 'members_count'
      )
         opts.order.by = `channels.${opts.order.by}`
      if (!opts?.order?.dir || !opts.order.dir.match(/^(asc|desc)$/i))
         opts.order.dir = 'asc'

      //  pagination: { page: 1, limit: 50 }
      opts.pagination.page = opts.pagination.page * 1 || 1
      opts.pagination.limit = opts.pagination.limit * 1 || 50
      if (opts.pagination.page < 1) opts.pagination.page = 1
      if (opts.pagination.limit < 1 || opts.pagination.limit > 50)
         opts.pagination.limit = 50
      opts.pagination.skip = (opts.pagination.page - 1) * opts.pagination.limit

      return opts
   },
}

class Channel {
   static async getChannel(channelId, creatorId) {
      if (!channelId) return null

      // Fetch channel information
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
            this.on('members.channel_id', '=', 'channels.id').andOn(
               db.raw(
                  `(select is_active from users where users.id = members.user_id limit 1)`
               ),
               '=',
               db.raw('true')
            )
         })
         .leftJoin('users', 'users.id', 'members.user_id')
         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')
         .andWhere(function () {
            this.where('channels.type', 'public').orWhere(function () {
               this.where('channels.type', 'private').andWhere(
                  'channels.creator',
                  creatorId
               )
            })
         })
         .andWhere('creator.is_active', '=', 'true')
         // .andWhere('members.is_active', '=', 'true')  //BUG: this is not working
         .groupBy('channels.id', 'creator.id')
         .first()

      if (!channel) return null
      if (!channel?.members?.at(0)?.id) channel.members = []

      return channel
   }

   /**
    *
    * @param {uuid} creatorId
    * @param { Object } opts
    * @param { Object } opts.order - Array of two elements
    * @param { String } opts.order.by - Column name to order by
    * @param { String } opts.order.dir - Order direction (asc or desc)
    * @param { Object } opts.pagination - Array of two elements
    * @param { Number } opts.pagination.page - the number of the page to return
    * @param { Number } opts.pagination.limit - the limit of channels to return
    * @param { String } opts.search - the search string to search for (name, description)
    * @returns
    */
   static async getAllChannels(
      userId,
      opts = {
         order: { by: 'id', dir: 'asc' },
         pagination: { page: 1, limit: 50, skip: 0 },
         search: null,
      }
   ) {
      opts = optsConstructor.getAll(opts)
      console.log(opts)

      // separate the query one for checking and searching
      const dbChannel = db('channels')
         .orderBy(opts.order.by, opts.order.dir)
         .offset(opts.pagination.skip)
         .limit(opts.pagination.limit)
         .where('channels.is_active', 'true')
         .andWhere('channels.type', 'public')
         .where(function () {
            this.whereNotIn('channels.id', function () {
               this.select('channel_id')
                  .from('channel_members')
                  .where('user_id', userId)
            }).andWhere('channels.creator', '<>', userId)
         })
      if (opts.search)
         dbChannel.andWhere(function () {
            this.whereRaw(
               "content_vector @@ websearch_to_tsquery('simple',?)",
               opts.search
            ).orWhereRaw(
               "content_vector @@ websearch_to_tsquery('english',?)",
               opts.search
            )
         })

      // and the other for getting the data
      const channels = await dbChannel
         .select(
            'channels.id',
            'channels.name',
            'channels.image_url',
            'channels.description',
            db.raw('CAST(count(members.user_id) AS INTEGER) as members_count')
         )
         .leftJoin(
            'channel_members as members',
            'channels.id',
            'members.channel_id'
         )
         .groupBy('channels.id')

      return [
         {
            total: channels?.length || 0,
            pagination: opts?.pagination,
            order: {
               by: opts?.order?.by.replace('channels.', ''),
               dir: opts?.order?.dir,
            },
         },
         channels,
      ]
   }

   static async createChannel(creator, { name, description, image_url, type }) {
      const userChannelsCount = Number(
         (
            await db
               .select(db.raw(`COUNT(*) as count`))
               .from('channels')
               .where('creator', creator)
               .first()
         ).count
      )

      if (userChannelsCount >= 5)
         throw new ErrorBuilder(
            'User have max channel number',
            400,
            'CREATE_CHANNEL'
         )

      const channel = await db('channels')
         .insert({
            creator,
            name,
            description,
            image_url,
            type,
         })
         .returning('*')

      return safeChannel(channel[0] || {})
   }

   static async updateChannel(channelId, creatorId, channelData) {
      const safeUpdate = safeChannelUpdate(channelData)

      const channel = await db('channels')
         .update({ ...safeUpdate, updated_at: db.fn.now() })
         .where({
            id: channelId,
            creator: creatorId,
            is_active: db.raw('true'),
         })
         .returning('*')

      return safeChannel(channel[0] || {}, { updated_at: true })
   }

   static async deleteChannel(channelId, creatorId) {
      const channel = await db('channels')
         .update({ is_active: false, updated_at: db.fn.now() })
         .where({
            id: channelId,
            creator: creatorId,
            is_active: db.raw('true'),
         })
         .returning('id')

      return channel[0]
   }

   static async createInvite(channelId, userId, usernameTo = '') {
      console.log('userId: ', userId)
      const channel = await db('channels')
         // select channel data and aggregate the members array and the creator object
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

         // join the creator data to the aggregated object and make sure the creator is active
         .leftJoin('users as creator', function () {
            this.on('creator.id', '=', 'channels.creator').andOn(
               'creator.is_active',
               '=',
               db.raw('true')
            )
         })

         // join the members data to the aggregated array
         // the users must be active
         // the array will contain from 0 to 2 elements
         // the 2 members will be the user who requested the invite
         // and the user who got the invite if the user is in the channel
         .leftJoin('channel_members as members', function () {
            this.on('members.channel_id', '=', 'channels.id')
               // i learned alot of how the 'on' works
               // it is basically a loop that will loop on every member
               // and i can apply conditions on every member
               .andOn(
                  // like this condition
                  // it will check if the user is active
                  // but not all users, it will check the user who is in this loop
                  db.raw(
                     `(select is_active from users where users.id = members.user_id limit 1)`
                  ),
                  '=',
                  db.raw('true')
               )
               .andOn(function () {
                  // same on here i am checking if the user in the current loop
                  // is with id = userId
                  this.on(
                     db.raw(
                        `(select id from users where users.id = members.user_id limit 1)`
                     ),
                     '=',
                     db.raw(`?`, userId)
                  )
                     // and here i am checking if the user in the current loop
                     // is with username = usernameTo
                     .orOn(
                        db.raw(
                           `(select username from users where users.id = members.user_id limit 1)`
                        ),
                        '=',
                        db.raw(`?`, usernameTo)
                     )
               })
         })
         // join the users data to the members array
         .leftJoin('users', 'users.id', 'members.user_id')

         // here we are filtering the channel by id and active
         .where('channels.id', channelId)
         .andWhere('channels.is_active', 'true')

         // checking if the creator is active
         .andWhere('creator.is_active', '=', 'true')
         .groupBy('channels.id', 'creator.id')
         .first()

      if (!channel) return null
      if (!channel?.members?.at(0)?.id) channel.members = []
      if (!channel?.creator?.id) channel.creator = {}

      const inviter =
         channel.creator?.id === userId
            ? channel.creator
            : channel.members.find((m) => m.id === userId)
      const invited = channel.members.find((m) => m.username === usernameTo)
      const isAuth =
         channel.type === 'public'
            ? true
            : inviter?.role === 'admin'
            ? true
            : false

      if (invited)
         throw new ErrorBuilder('User already in channel', 400, 'USER_EXISTS')
      if (!inviter)
         throw new ErrorBuilder('User not in channel', 400, 'USER_NOT_EXISTS')
      if (!isAuth)
         throw new ErrorBuilder('You are not authorized', 400, 'NOT_AUTHORIZED')

      console.log('inviter: ', inviter)
      console.log('invited: ', invited)

      return channel
   }
}

module.exports = Channel
