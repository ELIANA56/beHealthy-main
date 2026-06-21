/**
 * DATABASE CONNECTION — Opens one MySQL connection to behealthydb.
 * All models/controllers use this shared `db` object to run SQL queries.
 */
const mysql = require('mysql2');
const config = require('../config');

const db = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  multipleStatements: true,
});

db.on('error', (err) => {
  console.error('MySQL connection error:', err.message);
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    return;
  }
  console.log('Connected to MySQL (%s).', config.db.database);
});

module.exports = db;
