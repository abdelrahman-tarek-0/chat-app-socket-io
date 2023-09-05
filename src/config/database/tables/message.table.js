exports.channels_messages = (knex) => (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid())
    table.increments('raw_id').unique().unsigned().notNullable()

    table
        .uuid('sender_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

    table
        .uuid('channel_id')
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
        .notNullable()

    table
        .string('content')
        .notNullable()

    table
        .boolean('is_active')
        .defaultTo(true)
        
    table
        .uuid('reply_to')
        .references('id')
        .inTable('messages')
        .onDelete('CASCADE')
        .notNullable()

    table.timestamps(true, true)
};