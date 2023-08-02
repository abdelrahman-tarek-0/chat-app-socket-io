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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
   // install uuid extension
   console.time('Migration took')
   await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

   for (const name in tableMapping) {
      const table = tableMapping[name]

      if (!(await knex.schema.hasTable(name))) {
         await knex.schema.createTable(name, table(knex))
         console.log(`Table '${name}' created`)
      } else {
         console.log(`Table '${name}' already exists`)
      }
   }

   console.timeEnd('Migration took')
   return knex
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
