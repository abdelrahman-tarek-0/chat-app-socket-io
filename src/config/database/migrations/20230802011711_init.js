const {
   users,
   verifications,
   bonds,
   bondsRequests,
} = require('../tables/users.table')
const {
   channels,
   channelsInvites,
   channelsMembers,
} = require('../tables/channels.table')

const {
   messages,
   attachments,
   bonds_messages,
   channels_messages,
} = require('../tables/messages.table')

const tableMapping = {
   users: users,
   verifications: verifications,
   channels: channels,
   channel_invites: channelsInvites,
   channel_members: channelsMembers,
   bonds: bonds,
   bonds_requests: bondsRequests,
   messages: messages,
   attachments: attachments,
   bonds_messages: bonds_messages,
   channels_messages: channels_messages,
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
   await knex.raw(`
      CREATE OR REPLACE FUNCTION replace_special_characters(input_text TEXT) RETURNS TEXT AS $$
      BEGIN
         RETURN replace(replace(replace(replace(input_text, '_', ' '), '-', ' '), '.', ' '), '@', ' ');
      END;
      $$ LANGUAGE plpgsql;
      
      CREATE OR REPLACE FUNCTION users_insert_trigger() RETURNS TRIGGER AS $$
      BEGIN
         IF NEW.display_name IS NULL THEN
            NEW.display_name = replace_special_characters(NEW.username);
         END IF;
         RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      CREATE TRIGGER users_insert
      BEFORE INSERT ON users
      FOR EACH ROW
      EXECUTE FUNCTION users_insert_trigger();


      CREATE SEQUENCE IF NOT EXISTS bond_local_id_seq;

      CREATE OR REPLACE FUNCTION update_local_id()
      RETURNS TRIGGER AS $$
      BEGIN
         -- Calculate the local_id based on the bond_id
         NEW.local_id := (
            SELECT COALESCE(MAX(local_id), -1) + 1
            FROM bonds_messages
            WHERE bond_id = NEW.bond_id
         );

         RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER set_local_id
      BEFORE INSERT ON bonds_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_local_id();
`)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
   return knex.schema
      .dropTableIfExists('channel_members')
      .dropTableIfExists('channel_invites')
      .dropTableIfExists('bonds_requests')
      .dropTableIfExists('bonds_messages')
      .dropTableIfExists('channels_messages')
      .dropTableIfExists('verifications')
      .dropTableIfExists('attachments')

      .dropTableIfExists('messages')
      .dropTableIfExists('bonds')
      .dropTableIfExists('channels')
      .dropTableIfExists('users')
}
