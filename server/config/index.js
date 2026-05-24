// Minimal configuration
module.exports = {
  db: {
    host: 'localhost',
    user: 'root',                
    password: 'Ofakim123?',     
    database: 'behealthydb'     
  },
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'replace_this_with_env_secret'
};