/**
 * MEALS MODEL — SQL for Meals_Log table.
 * Enforces once-per-day rule for Breakfast, Lunch, Dinner.
 */
const ONCE_PER_DAY_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

function countMainMealOnDate(db, userId, mealType, logDate, excludeMealId = null) {
  if (mealType === 'Snack') return Promise.resolve(0);
  let sql = `SELECT COUNT(*) as cnt FROM Meals_Log
             WHERE User_ID = ? AND Meal_Type = ? AND Log_Date = ?`;
  const params = [userId, mealType, logDate];
  if (excludeMealId) {
    sql += ` AND Meal_ID != ?`;
    params.push(excludeMealId);
  }
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results[0].cnt || 0);
    });
  });
}

async function canLogMealType(db, userId, mealType, logDate, excludeMealId = null) {
  if (mealType === 'Snack') return { allowed: true };
  const count = await countMainMealOnDate(db, userId, mealType, logDate, excludeMealId);
  if (count > 0) {
    return {
      allowed: false,
      error: `You already logged ${mealType} for this day. You can add Snacks anytime, or edit/delete the existing ${mealType}.`,
    };
  }
  return { allowed: true };
}

function getMainMealsLoggedOnDate(db, userId, logDate) {
  const sql = `SELECT Meal_ID, Meal_Type FROM Meals_Log
               WHERE User_ID = ? AND Log_Date = ? AND Meal_Type IN ('Breakfast', 'Lunch', 'Dinner')`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId, logDate], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function insertMeal(db, { User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Food_Name, Description, Log_Date }) {
  const logDate = Log_Date || todayDate();
  const sql = `INSERT INTO Meals_Log
    (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Food_Name, Description, Log_Date, Timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CONCAT(?, ' ', TIME(NOW())))`;
  const params = [
    User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories,
    Food_Name || null, Description || null, logDate, logDate,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function getMealsByUser(db, userId) {
  const sql = `SELECT Meal_ID, User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams,
    Total_Calories, Food_Name, Description,
    DATE_FORMAT(Log_Date, '%Y-%m-%d') AS Log_Date,
    Timestamp
    FROM Meals_Log WHERE User_ID = ? ORDER BY Log_Date DESC, Timestamp DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function getDailyCalories(db, userId) {
  const sql = `SELECT SUM(Total_Calories) as total FROM Meals_Log
               WHERE User_ID = ? AND Log_Date = CURDATE()`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].total || 0);
    });
  });
}

function getDailyProtein(db, userId) {
  const sql = `SELECT SUM(Protein_Grams) as total FROM Meals_Log
               WHERE User_ID = ? AND Log_Date = CURDATE()`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(Math.round(Number(results[0].total) || 0));
    });
  });
}

const MEAL_CALORIE_SHARE = {
  Breakfast: 0.25,
  Lunch: 0.35,
  Dinner: 0.30,
  Snack: 0.10,
};

function getCaloriesForMealTypeToday(db, userId, mealType) {
  const sql = `SELECT SUM(Total_Calories) as total FROM Meals_Log
               WHERE User_ID = ? AND Meal_Type = ? AND Log_Date = CURDATE()`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId, mealType], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].total || 0);
    });
  });
}

async function getMealCalorieBudget(db, userId, mealType, dailyBudget) {
  const share = MEAL_CALORIE_SHARE[mealType] || 0.25;
  const mealBudget = Math.round(Number(dailyBudget) * share);
  const consumedForMeal = await getCaloriesForMealTypeToday(db, userId, mealType);
  const remaining = Math.max(mealBudget - consumedForMeal, 0);
  return {
    mealType,
    mealBudget,
    consumedForMeal,
    remaining,
    sharePercent: Math.round(share * 100),
  };
}

function getMealById(db, mealId, userId) {
  const sql = `SELECT * FROM Meals_Log WHERE Meal_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [mealId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

function updateMeal(db, mealId, userId, data) {
  const sql = `UPDATE Meals_Log SET
    Meal_Type = ?, Protein_Grams = ?, Carbs_Grams = ?, Fats_Grams = ?,
    Total_Calories = ?, Food_Name = ?, Description = ?
    WHERE Meal_ID = ? AND User_ID = ?`;
  const params = [
    data.Meal_Type,
    data.Protein_Grams,
    data.Carbs_Grams,
    data.Fats_Grams,
    data.Total_Calories,
    data.Food_Name || null,
    data.Description || null,
    mealId,
    userId,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

function deleteMeal(db, mealId, userId) {
  const sql = `DELETE FROM Meals_Log WHERE Meal_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [mealId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

module.exports = {
  insertMeal,
  getMealsByUser,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailyCalories,
  getDailyProtein,
  getCaloriesForMealTypeToday,
  getMealCalorieBudget,
  canLogMealType,
  getMainMealsLoggedOnDate,
  todayDate,
  ONCE_PER_DAY_TYPES,
  MEAL_CALORIE_SHARE,
};
