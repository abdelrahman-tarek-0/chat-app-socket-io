/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
   // install uuid extension
   return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() =>
      knex.schema
         .createTableIfNotExists('users', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.increments('raw_id').unique().unsigned().notNullable()

            table
               .string('name')
               .notNullable()
               .checkLength('<', 255, 'name_invalid_length_greater_than_255')

            table
               .string('email')
               .notNullable()
               .unique()
               .checkLength('<', 255, 'email_invalid_length_greater_than_255')
               .checkRegex(
                  '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$',
                  'email_invalid_format'
               )

            table.boolean('email_verified').defaultTo(false)

            table
               .string('password')
               .notNullable()
               .checkLength(
                  '<',
                  255,
                  'password_invalid_length_greater_than_255'
               )

            table
               .text('image_url')
               .defaultTo('default.png')
               .checkLength(
                  '<',
                  511,
                  'image_url_invalid_length_greater_than_511'
               )

            table
               .string('phone_number')
               .notNullable()
               .unique()
               .checkRegex(
                  '^[0-9]{1,4}-[0-9]{8,15}$',
                  'phone_number_invalid_format'
               )

            table
               .string('role')
               .defaultTo('user')
               .checkIn(
                  ['user', 'admin', 'moderator', 'super_admin'],
                  'role_invalid_value'
               )

            table.boolean('is_active').defaultTo(true)
            table.string('tokenizer').defaultTo('')

            table.timestamp('last_password_change_at').notNullable()
            table.timestamps(true, true)
         })
         .createTableIfNotExists('verifications', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.increments('raw_id').unique().unsigned().notNullable()
            table
               .uuid('user_id')
               .references('id')
               .inTable('users')
               .onDelete('CASCADE')
               .notNullable()

            table
               .string('reset')
               .notNullable()
               .checkLength('<', 255, 'reset_invalid_length_greater_than_255')

            table
               .string('reset_type')
               .notNullable()
               .checkIn(['code', 'token_link'])

            table
               .string('verification_for')
               .notNullable()
               .checkIn(
                  [
                     'email_verification',
                     'password_reset',
                     'phone_number_verification',
                     'email_change_verification',
                     'phone_number_change_verification',
                     'other',
                  ],
                  'type_invalid_value'
               )

            table
               .string('status')
               .defaultTo('active')
               .checkIn(['active', 'used', 'error'], 'status_invalid_value')

            table.timestamp('expires_at').notNullable()
            table.timestamps(true, true)
         })
         .createTableIfNotExists('channels', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.increments('raw_id').unique().unsigned().notNullable()

            table
               .uuid('creator')
               .references('id')
               .inTable('users')
               .onDelete('CASCADE')
               .notNullable()

            table
               .string('name')
               .notNullable()
               .checkLength('<', 255, 'name_invalid_length_greater_than_255')

            table
               .text('description')
               .notNullable()
               .checkLength(
                  '<',
                  1023,
                  'description_invalid_length_greater_than_1023'
               )

            table
               .string('image_url')
               .notNullable()
               .checkLength(
                  '<',
                  511,
                  'image_url_invalid_length_greater_than_511'
               )

            table
               .string('status')
               .defaultTo('active')
               .checkIn(['active', 'inactive'], 'status_invalid_value')

            table
               .string('type')
               .defaultTo('public')
               .checkIn(['public', 'private'], 'type_invalid_value')

            table.timestamps(true, true)
         })
         .createTableIfNotExists('channel_invites', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.increments('raw_id').unique().unsigned().notNullable()

            table
               .uuid('channel_id')
               .references('id')
               .inTable('channels')
               .onDelete('CASCADE')
               .notNullable()

            table
               .uuid('creator_id')
               .references('id')
               .inTable('users')
               .onDelete('CASCADE')
               .notNullable()

            table
               .string('type')
               .defaultTo('general')
               .checkIn(['general', 'directed'], 'type_invalid_value')

            table
               .uuid('target_id')
               .references('id')
               .inTable('users')
               .onDelete('CASCADE')
               .nullable()


            table.timestamp('expires_at').notNullable()

            table.timestamps(true, true)
         })
         .createTableIfNotExists('channel_members', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.increments('raw_id').unique().unsigned().notNullable()

            table
               .uuid('channel_id')
               .references('id')
               .inTable('channels')
               .onDelete('CASCADE')
               .notNullable()

            table
               .uuid('user_id')
               .references('id')
               .inTable('users')
               .onDelete('CASCADE')
               .notNullable()

            table
               .string('role')
               .defaultTo('member')
               .checkIn(['member', 'admin'], 'role_invalid_value')

            table.timestamps(true, true)
         })
   )
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
