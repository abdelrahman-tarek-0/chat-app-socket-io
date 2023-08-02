exports.channels = (knex) => (table) => {
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
      .checkLength('<', 1023, 'description_invalid_length_greater_than_1023')

   table
      .string('image_url')
      .notNullable()
      .checkLength('<', 511, 'image_url_invalid_length_greater_than_511')

   table
      .string('status')
      .defaultTo('active')
      .checkIn(['active', 'inactive'], 'status_invalid_value')

   table
      .string('type')
      .defaultTo('public')
      .checkIn(['public', 'private'], 'type_invalid_value')

   table.timestamps(true, true)
}

exports.channelsInvites = (knex) => (table) => {
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
}

exports.channelsMembers = (knex) => (table) => {
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
}
