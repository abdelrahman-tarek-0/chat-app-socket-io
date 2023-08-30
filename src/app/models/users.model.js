const db = require('../../config/database/db')
const { safeUser } = require('../utils/safeModel')
const ErrorBuilder = require('../utils/ErrorBuilder')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { randomString } = require('../utils/general.utils')

class User {
   static async getCurrentUserData(
      { id },
      opts = { unsafePass: {}, fields: [] }
   ) {
      let fields = ['base']

      if (opts?.fields?.length > 0) fields = opts.fields

      let userQuery = db('users as user')
         .where('user.id', id)
         .andWhere('user.is_active', '=', 'true')

      if (fields.includes('base')) userQuery = userQuery.select('user.*')

      if (fields.includes('creatorOf'))
         userQuery = userQuery
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
            })

      if (fields.includes('memberIn'))
         userQuery = userQuery
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
            .leftJoin('channels as c_member', 'cm.channel_id', 'c_member.id')

      if (fields.includes('bonds'))
         userQuery = userQuery
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
            })

      if (fields.includes('bondsRequestsSent'))
         userQuery = userQuery
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
            })

      if (fields.includes('bondsRequestsReceived'))
         userQuery = userQuery
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
            })

      const user = await userQuery.groupBy('user.id').first()

      if (!user) return null
      if (!user.creatorOf?.at(0)?.id) user.creatorOf = undefined
      if (!user.memberIn?.at(0)?.id) user.memberIn = undefined
      if (!user.bonds?.at(0)?.boundId) user.bonds = undefined
      if (!user.bondsRequestsSent?.at(0)?.requestId)
         user.bondsRequestsSent = undefined
      if (!user.bondsRequestsReceived?.at(0)?.requestId)
         user.bondsRequestsReceived = undefined

      return safeUser(user || {}, opts?.unsafePass || {})
   }

   static async getUserData(
      { targetName, userId },
      opts = { unsafePass: {}, fields: [] }
   ) {
      let fields = ['mutualChannels', 'mutualBonds']
      if (opts?.fields?.length > 0) fields = opts.fields

      let mutualChannels
      let mutualBonds
      let targetId = db.raw('(select id from users where username = ?)', [
         targetName,
      ])

      let userQuery = db('users as user')
         .select(
            'user.id as id',
            'user.username as username',
            'user.image_url as image_url',
            'user.display_name as display_name',
            'user.bio as bio',
            'user.created_at as created_at'
         )
         .where('user.username', targetName)
         .andWhere('user.is_active', '=', 'true')

      if (fields.includes('mutualChannels'))
         mutualChannels = db('channel_members AS c1')
            .distinct('c.id', 'c.name', 'c.description', 'c.image_url')
            .innerJoin(
               'channel_members AS c2',
               'c1.channel_id',
               'c2.channel_id'
            )
            .innerJoin('channels AS c', 'c.id', 'c1.channel_id')
            .where(function () {
               this.where(function () {
                  this.where('c1.user_id', userId).andWhere(
                     'c2.user_id',
                     targetId
                  ) // Both members
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

      if (fields.includes('mutualBonds'))
         mutualBonds = db('bonds as b')
            .distinct(
               'u1.username as user1',
               'u2.username as user2',
               'b.created_at as created_at'
            )
            .innerJoin('users as u1', 'b.user1_id', 'u1.id')
            .innerJoin('users as u2', 'b.user2_id', 'u2.id')
            .where(function () {
               this.where('b.user1_id', userId).orWhere('b.user2_id', userId)
            })
            .andWhere('b.status', '=', 'active')
            .union(function () {
               this.distinct(
                  'u1.username as user1',
                  'u2.username as user2',
                  'b.created_at as created_at'
               )
                  .from('bonds as b')
                  .innerJoin('users as u1', 'b.user1_id', 'u1.id')
                  .innerJoin('users as u2', 'b.user2_id', 'u2.id')
                  .where(function () {
                     this.where('b.user1_id', targetId).orWhere(
                        'b.user2_id',
                        targetId
                     )
                  })
                  .andWhere('b.status', '=', 'active')
            })

      const [user, mutualChannelsList, mutualBondsList] = await Promise.all([
         userQuery.groupBy('user.id').first(),
         mutualChannels,
         mutualBonds,
      ])

      return {
         ...safeUser(user || {}, opts?.unsafePass || {}),
         mutualChannels: mutualChannelsList,
         mutualBonds: mutualBondsList,
      }
   }

   static async updateUser(data) {
      const { id } = data

      let task
      if (!data.email_verified) {
         // background job to expire all other email verifications (no need to await)
         task = db('verifications')
            .update({
               status: 'expired',
               updated_at: db.fn.now(),
            })
            .where({
               user_id: id,
               verification_for: 'confirm_email',
               status: 'active',
            })
      } else if (data.email_verified && data.email) {
         throw new ErrorBuilder(
            'Email cannot be changed after verification',
            400,
            'EMAIL_ALREADY_VERIFIED'
         )
      }

      delete data.email_verified

      let user = db('users')
         .update({ ...data, updated_at: db.fn.now() })
         .where({
            id,
         })
         .returning('*')

      if (task) [user] = await Promise.all([user, task])
      else user = await user

      return safeUser(user[0] || {}, { updated_at: true })
   }

   static async disableMe({ id }) {
      const user = await db('users')
         .update({ is_active: false, updated_at: db.fn.now() })
         .where({
            id,
         })
         .returning('*')

      return safeUser(user[0] || {}, { updated_at: true })
   }

   static async changePassword({ id, oldPassword, newPassword }) {
      const user = await db('users')
         .select('*')
         .where({
            id,
         })
         .andWhere('is_active', '=', 'true')
         .first()

      if (oldPassword === newPassword)
         throw new ErrorBuilder(
            'New password cannot be same as old password',
            400,
            'SAME_PASSWORD'
         )

      if (!user || !(await comparePassword(oldPassword, user.password)))
         throw new ErrorBuilder(
            'Incorrect password',
            401,
            'INVALID_CREDENTIALS'
         )

      newPassword = await hashPassword(newPassword)
      const tokenizer = randomString(8)

      const updatedUser = await db('users')
         .update({
            password: newPassword,
            last_password_change_at: new Date(),
            tokenizer,
         })
         .where({
            id,
         })
         .returning('*')

      return safeUser(updatedUser[0] || {})
   }

   static async sendBondRequest({ requesterId, requestedUsername }) {
      let isBonded = db('bonds')
         .select('*')
         .where(function () {
            this.where(function () {
               this.where('user1_id', requesterId)
               this.andWhere(
                  'user2_id',
                  db.raw('(select id from users where username = ?)', [
                     requestedUsername,
                  ])
               )
            })
            this.orWhere(function () {
               this.where(
                  'user1_id',
                  db.raw('(select id from users where username = ?)', [
                     requestedUsername,
                  ])
               )
               this.andWhere('user2_id', requesterId)
            })
         })
         .andWhere('status', '=', 'active')
         .first()

      let user = db('users').select('*').where({
         username: requestedUsername,
         is_active: true,
      })

      ;[isBonded, user] = await Promise.all([isBonded, user])

      if (isBonded)
         throw new ErrorBuilder('Already bonded', 400, 'ALREADY_BONDED')

      if (!user[0])
         throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

      if (user[0].id === requesterId)
         throw new ErrorBuilder(
            'Cannot bond with yourself',
            400,
            'CANNOT_BOND_WITH_SELF'
         )

      const bondRequest = await db('bonds_requests')
         .insert({
            requester_id: requesterId,
            requested_id: user[0].id,
         })
         .returning('*')
         .onConflict()
         .ignore()

      return bondRequest[0]
   }

   static async acceptBondRequest({ bondRequestId, requestedId }) {
      const bondRequest = await db('bonds_requests')
         .delete()
         .where({
            // get the actual bond request by id
            id: bondRequestId,

            // check if the current user is the requested user
            requested_id: requestedId,
         })
         .returning('*')

      if (!bondRequest[0])
         throw new ErrorBuilder('Bond request not found', 404, 'NOT_FOUND')

      const requesterId = bondRequest[0].requester_id

      const bond = await db('bonds')
         .insert({
            user1_id: requesterId,
            user2_id: requestedId,
            status: 'active',
         })
         .onConflict(['user1_id', 'user2_id'])
         .merge()
         .returning('*')

      console.log(bond)

      return bond[0]
   }

   static async breakBond({ bondId, userId }) {
      const bond = await db('bonds')
         .update({
            status: 'inactive',
         })
         .where({
            id: bondId,
            status: 'active',
         })
         .andWhere(function () {
            this.where('user1_id', userId)
            this.orWhere('user2_id', userId)
         })
         .returning('*')

      if (!bond[0]) throw new ErrorBuilder('Bond not found', 404, 'NOT_FOUND')

      return bond[0]
   }
}

module.exports = User
