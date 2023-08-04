const { users, verifications } = require('../tables/users.table')
const {
   channels,
   channelsInvites,
   channelsMembers,
} = require('../tables/channels.table')

const tableMapping = {
   users: users,
   verifications: verifications,
   channels: channels,
   channel_invites: channelsInvites,
   channel_members: channelsMembers,
}
const tableNames = Object.keys(tableMapping)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
   const promises = []
   for (let i = 0; i < tableNames.length; i += 1) {
      const tableName = tableNames[i]
      const table = tableMapping[tableName]

      const promise = knex.schema.hasTable(tableName).then((exists) => {
         if (!exists) {
            console.log(`Table '${tableName}' created`)
            return knex.schema.createTable(tableName, table(knex))
         }
         console.log(`Table '${tableName}' already exists`)
      })
      promises.push(promise)
   }
   await Promise.all(promises)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
   return knex.schema
      .dropTableIfExists('channel_members')
      .dropTableIfExists('channel_invites')
      .dropTableIfExists('channels')
      .dropTableIfExists('verifications')
      .dropTableIfExists('users')
}
