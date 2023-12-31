exports.messages = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('sender_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .notNullable()

   table.string('content').notNullable()

   table.boolean('is_active').defaultTo(true)

   table
      .uuid('reply_to')
      .references('id')
      .inTable('messages')
      .onDelete('SET NULL')

   table.timestamps(true, true)
}

exports.attachments = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('message_id')
      .references('id')
      .inTable('messages')
      .onDelete('CASCADE')
      .notNullable()

   table.string('type').notNullable()

   table.string('url').notNullable()

   table.timestamps(true, true)
}

exports.channels_messages = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('channel_id')
      .references('id')
      .inTable('channels')
      .onDelete('CASCADE')
      .notNullable()

   table
      .uuid('message_id')
      .references('id')
      .inTable('messages')
      .onDelete('SET NULL')
      .notNullable()

   table.timestamps(true, true)
}

exports.bonds_messages = (knex) => (table) => {
   table.uuid('id').primary().defaultTo(knex.fn.uuid())
   table.increments('raw_id').unique().unsigned().notNullable()

   table
      .uuid('bond_id')
      .references('id')
      .inTable('bonds')
      .onDelete('CASCADE')
      .notNullable()

   table
      .uuid('message_id')
      .references('id')
      .inTable('messages')
      .onDelete('SET NULL')
      .notNullable()

   table.integer('local_id').unsigned().notNullable()

   table.timestamps(true, true)
}
