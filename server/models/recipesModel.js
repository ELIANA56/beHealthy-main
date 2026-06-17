// Fetch all recipes
function listRecipes(db) {
  const sql = `SELECT * FROM Recipes ORDER BY Recipe_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Save a new recipe (from Gemini) to the database
function createRecipe(db, recipeValues) {
  const sql = `
    INSERT INTO Recipes (Title, Ingredients, Instructions, Calories, Protein, Carbs, Fats, Created_By_AI)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, recipeValues, (err, result) => {
      if (err) return reject(err);
      resolve(result); // returns insertId
    });
  });
}

module.exports = { 
  listRecipes,
  createRecipe
};