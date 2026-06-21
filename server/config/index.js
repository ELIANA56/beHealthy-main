/**
 * CONFIG — Database connection settings, server port, JWT secret.
 * Password and host are here; sensitive keys (Google, AI) come from .env.
 */
// Minimal configuration
module.exports = {
  db: {
    host: 'localhost',
    user: 'root',                
    password: 'Ofakim123?',     
    database: 'behealthydb'     
  },
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET 
};