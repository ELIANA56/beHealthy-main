/**
 * WORKOUTS MODEL — SQL for Workouts table (exercise logs per user per day).
 */
function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createWorkout(db, data) {
  const logDate = data.Log_Date || todayDate();
  const sql = `INSERT INTO Workouts
    (User_ID, Workout_Type, Duration, Calories_Burned, Intensity, Notes, Extra_Calories, Extra_Protein, Log_Date, Logged_At)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CONCAT(?, ' ', TIME(NOW())))`;
  const params = [
    data.User_ID,
    data.Workout_Type,
    data.Duration,
    data.Calories_Burned,
    data.Intensity || 'Moderate',
    data.Notes || null,
    data.Extra_Calories || 0,
    data.Extra_Protein || 0,
    logDate,
    logDate,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function getWorkoutsByUser(db, userId) {
  const sql = `SELECT * FROM Workouts WHERE User_ID = ? ORDER BY Log_Date DESC, Logged_At DESC, Workout_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function getWorkoutsToday(db, userId) {
  const sql = `SELECT * FROM Workouts WHERE User_ID = ? AND Log_Date = CURDATE()`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function getWorkoutById(db, workoutId, userId) {
  const sql = `SELECT * FROM Workouts WHERE Workout_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [workoutId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function updateWorkout(db, workoutId, userId, data) {
  const sql = `UPDATE Workouts SET
    Workout_Type = ?, Duration = ?, Calories_Burned = ?, Intensity = ?,
    Notes = ?, Extra_Calories = ?, Extra_Protein = ?
    WHERE Workout_ID = ? AND User_ID = ?`;
  const params = [
    data.Workout_Type,
    data.Duration,
    data.Calories_Burned,
    data.Intensity || 'Moderate',
    data.Notes || null,
    data.Extra_Calories || 0,
    data.Extra_Protein || 0,
    workoutId,
    userId,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

function deleteWorkout(db, workoutId, userId) {
  const sql = `DELETE FROM Workouts WHERE Workout_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [workoutId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

module.exports = {
  createWorkout,
  getWorkoutsByUser,
  getWorkoutsToday,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
