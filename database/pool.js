const mariadb = require('mariadb');
const config =
  require('../config/config')[process.env.NODE_ENV || 'development'];

const logger = config.logger();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

pool.getConnection((error, connection) => {
  if (error) logger.info(`${config.errors.FAILEDDBCONNECTION} error:${error}`);
  if (connection) connection.release();

  return;
});

module.exports = pool;
