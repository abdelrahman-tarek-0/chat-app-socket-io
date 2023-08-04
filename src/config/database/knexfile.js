const { db } = require('../app.config')

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
   production: {
      client: 'postgresql',
      connection: {
         host: db.host,
         port: Number(db.port),
         user: db.user,
         database: db.database,
         password: db.password,
         ssl: true,
      },
      pool: {
         min: Number(db.poolMin) || 2,
         max: Number(db.poolMax) || 10,
      },
      migrations: {
         tableName: 'knex_migrations',
      },
   },
}
