exports.users = (knex) => (table) => {
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
      .checkLength('<', 255, 'password_invalid_length_greater_than_255')

   table
      .text('image_url')
      .defaultTo('default.png')
      .checkLength('<', 511, 'image_url_invalid_length_greater_than_511')

   table
      .string('phone_number')
      .unique()
      .checkRegex('^[0-9]{1,4}-[0-9]{8,15}$', 'phone_number_invalid_format')

   table
      .string('role')
      .defaultTo('user')
      .checkIn(
         ['user', 'admin', 'moderator', 'super_admin'],
         'role_invalid_value'
      )

   table
      .string('bio')
      .checkLength('<', 255, 'bio_invalid_length_greater_than_255')

   table.boolean('is_active').defaultTo(true)
   table.string('tokenizer').defaultTo('')

   table
      .timestamp('last_password_change_at')
      .defaultTo(knex.fn.now())
      .notNullable()
   table.timestamps(true, true)
}

exports.verifications = (knex) => (table) => {
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

   table.string('reset_type').notNullable().checkIn(['code', 'token_link'])

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
}
