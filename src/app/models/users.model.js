const db = require('../../config/database/db')
const { safeUser, safeUserUpdate } = require('../utils/safeModel')
const ErrorBuilder = require('../utils/ErrorBuilder')
const { hashPassword, comparePassword } = require('../utils/passwordHash')
const { randomString } = require('../utils/general.utils')

class User {
   static async getUserProfile({ id }, opts = { unsafePass: {} }) {
      const user = await db('users as user')
         .select(
            'user.*',
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_own.id, 'name', c_own.name, 'description', c_own.description, 'image', c_own.image_url)) as "creatorOf"`
            ),
            db.raw(
               `JSON_AGG(DISTINCT jsonb_build_object('id', c_member.id, 'name', c_member.name, 'description', c_member.description, 'image', c_member.image_url, 'role', cm.role)) as "memberIn"`
            )
         )
         .leftJoin('channels as c_own', function () {
            this.on('user.id', '=', 'c_own.creator').andOn(
               'c_own.is_active',
               '=',
               db.raw('true')
            )
         })
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

         .where('user.id', id)
         .andWhere('user.is_active', '=', 'true')
         // .andWhere('c_own.is_active', '=', 'true') //BUG same bug as in channel.model.js getChannel() but i fixed it in the 2 queries
         // .andWhere('c_member.is_active', '=', 'true')
         .groupBy('user.id')
         .first()

      if (!user) return null
      if (!user.creatorOf?.at(0)?.id) user.creatorOf = []
      if (!user.memberIn?.at(0)?.id) user.memberIn = []

      return safeUser(user || {}, opts?.unsafePass || {})
   }

   static async updateUser(data) {
      const { id } = data
      data = safeUserUpdate(data)

      const user = await db('users')
         .update({ ...data, updated_at: db.fn.now() })
         .where({
            id,
         })
         .returning('*')

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

      if (!user || !(await comparePassword(oldPassword, user.password)))
         throw new ErrorBuilder(
            'Incorrect password',
            401,
            'INVALID_CREDENTIALS'
         )

      if (oldPassword === newPassword)
         throw new ErrorBuilder(
            'New password must be different from old password',
            400,
            'BAD_REQUEST'
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
}

module.exports = User
