const users = require('./users.json')
const channels = require('./channels.json')
const channelsInvites = require('./channel_invites.json')
const channelsMembers = require('./channel_members.json')
const verifications = require('./verifications.json')
// the seed data is created by chatgpt ai

// knex db instance
const db = require('../db.js')

const tableMapping = {
   users: users,
   verifications: verifications,
   channels: channels,
   channel_invites: channelsInvites,
   channel_members: channelsMembers,
}

const seed = async () => {
   for (const table in tableMapping) {
      const rows = tableMapping[table]

      console.log(`Seeding ${rows.length} rows into ${table} table...`)
      await db(table).insert(rows)
   }
   db.destroy()
}

seed()