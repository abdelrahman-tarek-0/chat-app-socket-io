const path = require('path')
require('dotenv').config({
   path: path.resolve(__dirname, '../../../.env'),
})

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
   production: {
      client: 'postgresql',
      connection: {
         host: process.env.DB_HOST,
         port: Number(process.env.DB_PORT),
         user: process.env.DB_USER,
         database: process.env.DB_NAME,
         password: process.env.DB_PASSWORD,
         ssl: true,
      },
      pool: {
         min: Number(process.env.DB_POOL_MIN) || 2,
         max: Number(process.env.DB_POOL_MAX) || 10,
      },
      migrations: {
         tableName: 'knex_migrations',
      },
      
   },
}
