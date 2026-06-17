function migrateAuthCleanup(db) {
  return new Promise((resolve) => {
    db.query('DROP TABLE IF EXISTS User_Auth', (dropErr) => {
      if (dropErr) console.error('Drop User_Auth:', dropErr.message);

      db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Firebase_UID'`,
        (colErr, cols) => {
          if (colErr) {
            console.error('Auth cleanup column check:', colErr.message);
            return finishGoogleId(db, resolve);
          }
          if (cols.length > 0) {
            db.query(
              'ALTER TABLE Users CHANGE Firebase_UID Google_ID VARCHAR(128) UNIQUE',
              (renameErr) => {
                if (renameErr && renameErr.code !== 'ER_DUP_FIELDNAME') {
                  console.error('Rename Firebase_UID:', renameErr.message);
                }
                finishGoogleId(db, resolve);
              }
            );
          } else {
            finishGoogleId(db, resolve);
          }
        }
      );
    });
  });
}

function finishGoogleId(db, resolve) {
  db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Google_ID'`,
    (err, cols) => {
      if (!err && cols.length === 0) {
        db.query('ALTER TABLE Users ADD COLUMN Google_ID VARCHAR(128) UNIQUE', (addErr) => {
          if (addErr && addErr.code !== 'ER_DUP_FIELDNAME') {
            console.error('Add Google_ID:', addErr.message);
          }
          resolve();
        });
      } else {
        resolve();
      }
    }
  );
}

module.exports = { migrateAuthCleanup };
