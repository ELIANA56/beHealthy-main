function insertMeal(db, { User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories }) {
  const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  const params = [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories];
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
  // On somme les calories où le User_ID correspond et où la date est aujourd'hui
  const sql = `SELECT SUM(Total_Calories) as total FROM Meals_Log 
               WHERE User_ID = ? AND DATE(Timestamp) = CURDATE()`;
  
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      // Si aucune donnée, SUM renvoie null, on force à 0
      resolve(results[0].total || 0);
    });
  });
}

// N'oubliez pas d'ajouter cette fonction à l'export
module.exports = { insertMeal, getMealsByUser, getDailyCalories };


