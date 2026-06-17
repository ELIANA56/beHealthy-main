function insertMeal(db, { User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Food_Name, Description }) {
  const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Food_Name, Description, Timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  const params = [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Food_Name || null, Description || null];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function getMealsByUser(db, userId) {
  const sql = `SELECT * FROM Meals_Log WHERE User_ID = ? ORDER BY Timestamp DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
function getDailyCalories(db, userId) {
  // Sum calories for this user where the date is today
  const sql = `SELECT SUM(Total_Calories) as total FROM Meals_Log 
               WHERE User_ID = ? AND DATE(Timestamp) = CURDATE()`;
  
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      // If no data, SUM returns null — default to 0
      resolve(results[0].total || 0);
    });
  });
}

module.exports = { insertMeal, getMealsByUser, getDailyCalories };


