const db = require('../../config/database/db')
const { safeUser } = require('../utils/safeModel')
const ErrorBuilder = require('../utils/ErrorBuilder')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { randomString } = require('../utils/general.utils')

const { buildGetUserQuery } = require('./query-builders/users.query-builders')

class User {
   static async getCurrentUserData(
      { id },
      opts = { unsafePass: {}, fields: [] }
   ) {
      let { fields } = opts

      if (!opts?.fields?.length) fields = ['base']

      let userQuery = buildGetUserQuery.build(id)

      fields.forEach((field) => {
         userQuery = buildGetUserQuery[field](userQuery)
      })
      
      const user = await userQuery.groupBy('user.id').first()

      if (!user) return null
      
      // sanitize
      if (!user.creatorOf?.at(0)?.id) user.creatorOf = undefined
      if (!user.memberIn?.at(0)?.id) user.memberIn = undefined
      if (!user.bonds?.at(0)?.boundId) user.bonds = undefined
      if (!user.bondsRequestsSent?.at(0)?.requestId)
         user.bondsRequestsSent = undefined
      if (!user.bondsRequestsReceived?.at(0)?.requestId)
         user.bondsRequestsReceived = undefined
      if (!user.inviteSent?.at(0)?.id) user.inviteSent = undefined
      if (!user.inviteReceived?.at(0)?.id) user.inviteReceived = undefined
     

      return safeUser(user || {}, opts?.unsafePass || {})
   }

   static async getUserData(
      { targetName, userId },
      opts = { unsafePass: {}, fields: [] }
   ) {
      let { fields } = opts

      if (!opts?.fields?.length) fields = ['base']

      let mutualChannels
      let mutualBonds
      const targetId = db.raw('(select id from users where username = ?)', [
         targetName,
      ])

      const userQuery = db('users as user')
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

      if (fields.includes('mutualBonds')) {
         mutualBonds = db.raw(
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
      }

      const [user, mutualChannelsList, mutualBondsList] = await Promise.all([
         userQuery.groupBy('user.id').first(),
         mutualChannels,
         mutualBonds,
      ])

      return {
         ...safeUser(user || {}, opts?.unsafePass || {}),
         mutualChannels: mutualChannelsList,
         mutualBonds: mutualBondsList?.rows?.at(0),
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
            'Illegal operation changing email on update , please request a change email instead',
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
