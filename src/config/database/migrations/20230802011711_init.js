/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
   // install uuid extension
   return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() =>
      knex.schema.createTableIfNotExists('users', (table) => {
         table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
         table.increments('raw_id').unsigned().notNullable().unique().index()

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

         table
            .string('password')
            .notNullable()
            .checkLength('<', 255, 'password_invalid_length_greater_than_255')

         table
            .text('image_url')
            .defaultTo('default.png')
            .checkLength('<', 511, 'image_url_invalid_length_greater_than_511')

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

         table.timestamps(true, true)
      })
   )
}


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
   return knex.schema.dropTableIfExists('users')
}
