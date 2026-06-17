const MEAL_COLUMNS = ['ADD COLUMN Log_Date DATE'];

function migrateMealsSchema(db) {
  return new Promise((resolve) => {
    db.query(`ALTER TABLE Meals_Log ${MEAL_COLUMNS[0]}`, (err) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Meals migration:', err.message);
      }
      db.query(
        'UPDATE Meals_Log SET Log_Date = DATE(Timestamp) WHERE Log_Date IS NULL AND Timestamp IS NOT NULL',
        () => {
          db.query(
            'UPDATE Meals_Log SET Log_Date = CURDATE() WHERE Log_Date IS NULL',
            () => resolve()
          );
        }
      );
    });
  });
}

module.exports = { migrateMealsSchema };
