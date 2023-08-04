const db = require('../../config/database/db')

const { safeChannelUpdate } = require('../utils/safeModel')

const ErrorBuilder = require('../utils/ErrorBuilder')

const optsConstructor = {
   getAll: (opts) => {
      const allowOrderBy = ['id', 'name', 'type', 'members_count', 'created_at']
      console.log('opts raw: ', opts)

      if (!opts) opts = {}
      if (!opts?.order) opts.order = {}
      if (!opts?.pagination) opts.pagination = {}

      // deep: true
      if (typeof opts.deep !== 'boolean') opts.deep = false

      // order: {by:'id',ord:'asc'}
      if (!opts?.order?.by || !allowOrderBy.includes(opts.order.by))
         opts.order.by = 'id'
      if (
         allowOrderBy.includes(opts.order.by) &&
         opts?.order?.by !== 'members_count'
      )
         opts.order.by = `channels.${opts.order.by}`
      if (opts?.order?.by === 'members_count') opts.order.by = 'members_count'
      if (!opts?.order?.ord || !opts.order.ord.match(/^(asc|desc)$/i))
         opts.order.ord = 'asc'

      //  pagination: { p: 1, l: 50 }
      opts.pagination.p *= 1
      opts.pagination.l *= 1
      if (!opts.pagination.p || opts.pagination.p < 1) opts.pagination.p = 1
      if (!opts.pagination.l || opts.pagination.l < 1 || opts.pagination.l > 50)
         opts.pagination.l = 50
      opts.pagination.s = (opts.pagination.p - 1) * opts.pagination.l

      return opts
   },
}

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
         .andWhere('channels.is_active', 'true')
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

   /**
    *
    * @param {uuid} creatorId
    * @param { Object } opts
    * @param { Boolean } opts.deep - If true, returns all channels with all members and creator info, else returns only basic info
    * @param { Object } opts.order - Array of two elements
    * @param { String } opts.order.by - Column name to order by
    * @param { String } opts.order.ord - Order direction (asc or desc)
    * @param { Object } opts.pagination - Array of two elements
    * @param { Number } opts.pagination.p - the number of the page to return
    * @param { Number } opts.pagination.l - the limit of channels to return
    * @param { Number } opts.pagination.s - the offset to start from (generated on the fly)
    * @returns
    */
   static async getAllChannels(
      creatorId,
      opts = {
         deep: false,
         order: { by: 'id', ord: 'asc' },
         pagination: { p: 1, l: 50, s: 0 },
      }
   ) {
      opts = optsConstructor.getAll(opts)
      console.log(opts)
      let channels = []

      const dbChan = db('channels')
         .orderBy(opts.order.by, opts.order.ord)
         .offset(opts.pagination.s)
         .limit(opts.pagination.l)
         .where('channels.is_active', 'true')

      if (!opts.deep) {
         channels = await dbChan
            .select(
               'channels.id',
               'channels.name',
               'channels.image_url',
               'channels.description',
               db.raw('count(members.user_id) + 1  as members_count')
            )
            .leftJoin(
               'channel_members as members',
               'channels.id',
               'members.channel_id'
            )
            .andWhere('channels.type', 'public')
            .groupBy('channels.id')
      } else {
         channels = await dbChan
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
                  `CASE WHEN COUNT(members.user_id) > 0
          THEN json_agg(json_build_object('id', members.user_id, 'role', members.role, 'name', users.name, 'bio', users.bio, 'image_url', users.image_url))
          ELSE NULL END as members`
               ),
               db.raw('count(members.user_id) + 1  as members_count')
            )
            .leftJoin('users as creator', 'creator.id', 'channels.creator')
            .leftJoin(
               'channel_members as members',
               'channels.id',
               'members.channel_id'
            )
            .leftJoin('users', 'users.id', 'members.user_id')
            .andWhere(function () {
               this.where('channels.type', 'public').orWhere(function () {
                  this.where('channels.type', 'private').andWhere(
                     'channels.creator',
                     creatorId
                  )
               })
            })
            .groupBy('channels.id', 'creator.id')
      }
      return channels
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

      return channel[0]
   }

   static async updateChannel(channelId, creatorId, channelData) {
      const safeUpdate = safeChannelUpdate(channelData)

      const channel = await db('channels')
         .update({ ...safeUpdate, updated_at: db.fn.now() })
         .where('id', channelId)
         .andWhere('creator', creatorId)
         .andWhere('is_active', 'true')
         .returning('*')

      return channel[0]
   }
}

module.exports = Channel
