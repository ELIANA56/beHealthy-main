function createUser(db, { Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender, Email }) {
  const sql = `INSERT INTO Users (Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender, Email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender, Email];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function findUserByEmail(db, Email) {
  const sql = `SELECT User_ID, Email FROM Users WHERE Email = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [Email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function getUserProfile(db, userId) {
  const sql = `SELECT * FROM Users WHERE User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function findUserByEmailExcept(db, email, excludeUserId) {
  const sql = `SELECT User_ID FROM Users WHERE Email = ? AND User_ID != ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [email, excludeUserId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function updateUserProfile(db, userId, data) {
  const sql = `UPDATE Users SET
    Full_Name = ?, Age = ?, Weight = ?, Height = ?, Gender = ?,
    Goal_Type = ?, Activity_Factor = ?, Daily_Calorie_Budget = ?, Email = ?
    WHERE User_ID = ?`;
  const params = [
    data.Full_Name,
    data.Age,
    data.Weight,
    data.Height,
    data.Gender,
    data.Goal_Type,
    data.Activity_Factor,
    data.Daily_Calorie_Budget,
    data.Email,
    userId,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

function updatePassword(db, userId, passwordHash) {
  const sql = `UPDATE Users SET Password_Hash = ? WHERE User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [passwordHash, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function deleteUserAccount(db, userId) {
  const user = await getUserProfile(db, userId);
  if (!user) return false;

  await runQuery(db, 'DELETE FROM Recipes WHERE User_ID = ?', [userId]);
  await runQuery(db, 'DELETE FROM Meals_Log WHERE User_ID = ?', [userId]);
  await runQuery(db, 'DELETE FROM Workouts WHERE User_ID = ?', [userId]);

  try {
    await runQuery(db, 'DELETE FROM Health_Trends WHERE User_ID = ?', [userId]);
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  const result = await runQuery(db, 'DELETE FROM Users WHERE User_ID = ?', [userId]);
  return result.affectedRows > 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailExcept,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUserAccount,
};
