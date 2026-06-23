/**
 * CONFIG — Database connection settings, server port, JWT secret.
 */
require('dotenv').config();

module.exports = {
  db: {
    host: 'localhost',
    user: 'root',
    password: 'Ofakim123?',
    database: 'behealthydb',
  },
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'behealthy-local-dev-secret',
};