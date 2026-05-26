// פונקציה לשליפת כל המתכונים
function listRecipes(db) {
  const sql = `SELECT * FROM Recipes ORDER BY Recipe_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// פונקציה לשמירת מתכון חדש (של ג'מיני) ב-Database
function createRecipe(db, recipeValues) {
  const sql = `
    INSERT INTO Recipes (Title, Ingredients, Instructions, Calories, Protein, Carbs, Fats, Created_By_AI)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, recipeValues, (err, result) => {
      if (err) return reject(err);
      resolve(result); // יחזיר את ה-insertId
    });
  });
}

module.exports = { 
  listRecipes,
  createRecipe
};