const db = require('../../../config/database/db')

exports.buildGetCurrentUserQuery = {
   build: (userId) =>
      db('users as user')
         .where('user.id', userId)
         .andWhere('user.is_active', '=', 'true'),
   base: (query) => query.select('user.*'),
   creatorOf: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
              'id', c_own.id,
              'name', c_own.name,
              'description', c_own.description,
              'image', c_own.image_url)) as "creatorOf"`
            )
         )
         .leftJoin('channels as c_own', function () {
            this.on('user.id', '=', 'c_own.creator').andOn(
               'c_own.is_active',
               '=',
               db.raw('true')
            )
         }),
   memberIn: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
           'id', c_member.id,
           'name', c_member.name,
           'description', c_member.description,
           'image', c_member.image_url,
           'role', cm.role)) as "memberIn"`
            )
         )
         .leftJoin('channel_members as cm', function () {
            this.on('user.id', '=', 'cm.user_id').andOn(
               db.raw(
                  '(select is_active from channels where channels.id = cm.channel_id limit 1)'
               ),
               '=',
               db.raw('true')
            )
         })
         .leftJoin('channels as c_member', 'cm.channel_id', 'c_member.id'),
   bonds: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('boundId', b.id,
          'userId', b_u.id,
          'username', b_u.username,
          'image' , b_u.image_url,
          'created_at', b.created_at
          )) as "bonds"`
            )
         )
         .leftJoin('bonds as b', function () {
            this.on(function () {
               this.on('user.id', '=', 'b.user1_id')
               this.orOn('user.id', '=', 'b.user2_id')
            })
            this.andOn('b.status', '=', db.raw('?', ['active']))
         })
         .leftJoin('users as b_u', function () {
            this.on(function () {
               this.on('b_u.id', '=', 'b.user1_id')
               this.orOn('b_u.id', '=', 'b.user2_id')
            })
            this.andOn('b_u.is_active', '=', db.raw('?', ['true']))
            this.andOn('b_u.id', '!=', 'user.id')
         }),
   bondsRequestsSent: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
              'requestId', brs.id,
              'userId', brs_u.id,
              'username', brs_u.username,
              'image' , brs_u.image_url,
              'created_at', brs.created_at
           )) as "bondsRequestsSent"`
            )
         )
         .leftJoin('bonds_requests as brs', function () {
            this.on('user.id', '=', 'brs.requester_id')
         })
         .leftJoin('users as brs_u', function () {
            this.on('brs_u.id', '=', 'brs.requested_id')
            this.andOn('brs_u.is_active', '=', db.raw('?', ['true']))
         }),

   bondsRequestsReceived: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
                  'requestId', brr.id,
                  'userId', brr_u.id,
                  'username', brr_u.username,
                  'image' , brr_u.image_url,
                  'created_at', brr.created_at
                  )) as "bondsRequestsReceived"`
            )
         )
         .leftJoin('bonds_requests as brr', function () {
            this.on('user.id', '=', 'brr.requested_id')
         })
         .leftJoin('users as brr_u', function () {
            this.on('brr_u.id', '=', 'brr.requester_id')
            this.andOn('brr_u.is_active', '=', db.raw('?', ['true']))
         }),

   inviteSent: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
              'id', i.id,
              'channelId', i_c.id,
              'channelName', i_c.name,
              'channelImage' , i_c.image_url,
              'targetId', i_t.id,
              'targetUsername', i_t.username,
              'targetImage' , i_t.image_url,
              'createdAt', i.created_at
              )) as "inviteSent"`
            )
         )
         .leftJoin('channel_invites as i', function () {
            this.on('user.id', '=', 'i.creator_id')
            this.andOn('i.type', '=', db.raw('?', ['directed']))
            this.andOn('i.expires_at', '>', db.fn.now())
         })
         .leftJoin('channels as i_c', function () {
            this.on('i_c.id', '=', 'i.channel_id')
            this.andOn('i_c.is_active', '=', db.raw('?', ['true']))
         })
         .leftJoin('users as i_t', function () {
            this.on('i_t.id', '=', 'i.target_id')
            this.andOn('i_t.is_active', '=', db.raw('?', ['true']))
         }),

   inviteReceived: (query) =>
      query
         .select(
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object(
              'id', i2.id,
              'channelId', i2_c.id,
              'channelName', i2_c.name,
              'channelImage' , i2_c.image_url,
              'senderId', i_s.id,
              'senderUsername', i_s.username,
              'senderImage' , i_s.image_url,
              'alias', i2.alias,
              'createdAt', i2.created_at
              )) as "inviteReceived"`
            )
         )
         .leftJoin('channel_invites as i2', function () {
            this.on('user.id', '=', 'i2.target_id')
            this.andOn('i2.type', '=', db.raw('?', ['directed']))
            this.andOn('i2.expires_at', '>', db.fn.now())
         })
         .leftJoin('channels as i2_c', function () {
            this.on('i2_c.id', '=', 'i2.channel_id')
            this.andOn('i2_c.is_active', '=', db.raw('?', ['true']))
         })
         .leftJoin('users as i_s', function () {
            this.on('i_s.id', '=', 'i2.creator_id')
            this.andOn('i_s.is_active', '=', db.raw('?', ['true']))
         }),
}

exports.buildGetUserQuery = {
   build: (username) =>
      db('users as user')
         .where('user.username', username)
         .andWhere('user.is_active', '=', 'true'),
   base: (query) =>
      query.select(
         'user.id as id',
         'user.username as username',
         'user.image_url as image_url',
         'user.display_name as display_name',
         'user.bio as bio',
         'user.created_at as created_at'
      ),

   mutualChannels: (userId, targetName) => {
      const targetId = db.raw('(select id from users where username = ?)', [
         targetName,
      ])

      return db('channel_members AS c1')
         .distinct('c.id', 'c.name', 'c.description', 'c.image_url')
         .innerJoin('channel_members AS c2', 'c1.channel_id', 'c2.channel_id')
         .innerJoin('channels AS c', 'c.id', 'c1.channel_id')
         .where(function () {
            this.where(function () {
               this.where('c1.user_id', userId).andWhere('c2.user_id', targetId) // Both members
            })
               .orWhere(function () {
                  this.where('c1.user_id', userId).andWhere(
                     'c.creator',
                     targetId
                  ) // User1 is member, User2 is creator
               })
               .orWhere(function () {
                  this.where('c1.user_id', targetId).andWhere(
                     'c.creator',
                     userId
                  ) // User2 is member, User1 is creator
               })
         })
   },

   mutualBonds: (userId, targetName) => {
      const targetId = db.raw('(select id from users where username = ?)', [
         targetName,
      ])

      return db.raw(
         `
            SELECT UserAFriends.UserId, users.id, users.username, users.display_name, users.image_url FROM
            (
              SELECT user2_id UserId FROM bonds WHERE user1_id = :userId
                UNION 
              SELECT user1_id UserId FROM bonds WHERE user2_id = :userId
            ) AS UserAFriends
            JOIN  
            (
              SELECT user2_id UserId FROM bonds WHERE user1_id = :targetId
                UNION 
              SELECT user1_id UserId FROM bonds WHERE user2_id = :targetId
            ) AS UserBFriends 
            ON  UserAFriends.UserId = UserBFriends.UserId
            left join users on users.id = UserAFriends.UserId
         `,
         { userId, targetId }
      )
   },
}
