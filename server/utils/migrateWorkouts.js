const WORKOUT_COLUMNS = [
  "ADD COLUMN Intensity ENUM('Light', 'Moderate', 'Intense') DEFAULT 'Moderate'",
  'ADD COLUMN Notes TEXT',
  'ADD COLUMN Extra_Calories INT DEFAULT 0',
  'ADD COLUMN Extra_Protein INT DEFAULT 0',
  'ADD COLUMN Logged_At DATETIME DEFAULT CURRENT_TIMESTAMP',
  'ADD COLUMN Log_Date DATE',
];

function migrateWorkoutsSchema(db) {
  return new Promise((resolve) => {
    let pending = WORKOUT_COLUMNS.length;
    WORKOUT_COLUMNS.forEach((clause) => {
      db.query(`ALTER TABLE Workouts ${clause}`, (err) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') {
          console.error('Workouts migration:', err.message);
        }
        pending -= 1;
        if (pending === 0) {
          db.query(
            'UPDATE Workouts SET Log_Date = DATE(Logged_At) WHERE Log_Date IS NULL AND Logged_At IS NOT NULL',
            () => {
              db.query(
                'UPDATE Workouts SET Log_Date = CURDATE() WHERE Log_Date IS NULL',
                () => resolve()
              );
            }
          );
        }
      });
    });
  });
}

module.exports = { migrateWorkoutsSchema };
