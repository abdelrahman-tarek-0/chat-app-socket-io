exports.channels = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
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
      .defaultTo('default_channel.png')
      .checkLength('<', 511, 'image_url_invalid_length_greater_than_511')

   table.boolean('is_active').defaultTo(true)

   table
      .string('type')
      .notNullable()
      .checkIn(['public', 'private'], 'type_invalid_value')

   table.timestamps(true, true)

   table.specificType(
      'content_vector',
      `TSVECTOR GENERATED ALWAYS AS 
      (setweight(to_tsvector('simple', coalesce("name", '')::text), 'A')
      || ' ' || 
       setweight(to_tsvector('simple', coalesce("description", '')::text), 'B'))
      STORED`
   )
   table.index('content_vector', null, 'gin')
}

exports.channelsInvites = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
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
  
   table.string('alias').notNullable().unique()

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
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
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

   table.unique(['channel_id', 'user_id'])

   table.timestamps(true, true)
}
