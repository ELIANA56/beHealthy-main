function migrateUsersSchema(db) {
  return new Promise((resolve) => {
    db.query('ALTER TABLE Users ADD COLUMN Activity_Factor DECIMAL(4,3) DEFAULT 1.200', (err) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Users migration (Activity_Factor):', err.message);
      }
      resolve();
    });
  });
}

module.exports = { migrateUsersSchema };
