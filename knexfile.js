// Update with your config settings.

import 'dotenv/config';

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const knexConfig = {

  development: {
    client: "mysql2",
    connection: {
      host: process.env.MYSQL_HOST || "127.0.0.1",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "yourpassword",
      database: process.env.MYSQL_DATABASE || "social_scheduler_db"
    },
    migrations: {
      directory: "./migrations"
    }
  }

  // staging: {
  //   client: 'mysql2',
  //   connection: {
  //     database: process.env.MYSQL_DATABASE,
  //     user:     process.env.MYSQL_USER,
  //     password: process.env.MYSQL_PASSWORD
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'mysql2',
  //   connection: {
  //     database: process.env.MYSQL_DATABASE,
  //     user:     process.env.MYSQL_USER,
  //     password: process.env.MYSQL_PASSWORD
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};

export default knexConfig;
