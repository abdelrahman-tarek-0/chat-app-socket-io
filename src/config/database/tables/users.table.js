exports.users = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   // this is field have a trigger to set the value if not provided
   table.string('display_name').notNullable()
   table.check('LENGTH(display_name) >= 1 and LENGTH(display_name) <= 255')

   table
      .string('username')
      .notNullable()
      .unique()
      .checkRegex('^[A-Za-z][A-Za-z0-9_@\\-.]{7,29}$')
   table.check('LENGTH(username) >= 8 and LENGTH(username) <= 30')

   table
      .string('email')
      .notNullable()
      .unique()
      .checkRegex(
         '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$',
         'email_invalid_format'
      )
   table.check('LENGTH(email) >= 8 and LENGTH(email) <= 255')

   table.boolean('email_verified').defaultTo(false)

   table.string('password').notNullable()
   table.check('LENGTH(password) >= 8 and LENGTH(password) <= 255')

   table
      .text('image_url')
      .defaultTo('default.png')
      .checkLength('<', 511, 'image_url_invalid_length_greater_than_511')
   table.check('LENGTH(image_url) <= 512')

   table
      .string('phone_number')
      .unique()
      .checkRegex('^[0-9]{1,4}-[0-9]{8,15}$', 'phone_number_invalid_format')
   table.check('LENGTH(phone_number) <= 20')

   table
      .string('role')
      .defaultTo('user')
      .checkIn(
         ['user', 'admin', 'moderator', 'super_admin'],
         'role_invalid_value'
      )

   table
      .string('bio')
      .checkLength('<', 511, 'bio_invalid_length_greater_than_255')

   table.boolean('is_active').defaultTo(true)

   table.string('tokenizer').defaultTo('')
   table.check('LENGTH(tokenizer) = 8')

   table
      .timestamp('last_password_change_at')
      .defaultTo(knex.fn.now())
      .notNullable()
   table.timestamps(true, true)
}

exports.verifications = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
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

   table.string('verification_for').notNullable()

   table
      .string('status')
      .defaultTo('active')
      .checkIn(['active', 'used', 'error', 'expired'], 'status_invalid_value')

   table.timestamp('expires_at').notNullable()
   table.timestamps(true, true)
}

exports.bonds = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('user1_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable()

   table
      .uuid('user2_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable()

   table
      .string('status')
      .defaultTo('active')
      .checkIn(['active', 'inactive'], 'status_invalid_value')

   table.specificType(
      'unique_bond',
      `
      text UNIQUE generated always as 
      ( LEAST(CAST(user1_id AS TEXT) , CAST(user2_id AS TEXT) ) || ' ' || GREATEST(CAST(user1_id AS TEXT)  , CAST(user2_id AS TEXT)) ) stored
      `
   )

   table.unique(['user1_id', 'user2_id'])
   table.unique(['user2_id', 'user1_id'])

   table.timestamps(true, true)
}

exports.bondsRequests = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('requester_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable()

   table
      .uuid('requested_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable()

   table.unique(['requester_id', 'requested_id'])
   table.unique(['requested_id', 'requester_id'])

   table.specificType(
      'unique_bond_request',
      `
      text UNIQUE generated always as
      ( LEAST(CAST(requester_id AS TEXT) , CAST(requested_id AS TEXT) ) || ' ' || GREATEST(CAST(requester_id AS TEXT)  , CAST(requested_id AS TEXT)) ) stored
      `
   )

   table.timestamps(true, true)
}
