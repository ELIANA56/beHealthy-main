function formatRecipeRow(recipe) {
  let ingredients = [];
  let instructions = [];
  let sourceIngredients = [];

  try {
    ingredients = JSON.parse(recipe.Ingredients || '[]');
  } catch {
    ingredients = recipe.Ingredients ? [recipe.Ingredients] : [];
  }
  try {
    instructions = JSON.parse(recipe.Instructions || '[]');
  } catch {
    instructions = recipe.Instructions ? [recipe.Instructions] : [];
  }
  try {
    sourceIngredients = JSON.parse(recipe.Source_Ingredients || '[]');
  } catch {
    sourceIngredients = [];
  }

  return {
    Recipe_ID: recipe.Recipe_ID,
    Recipe_Name: recipe.Title,
    Title: recipe.Title,
    Meal_Type: recipe.Meal_Type,
    Ingredients: ingredients,
    Instructions: instructions,
    Source_Ingredients: sourceIngredients,
    Calories: recipe.Calories_Per_Serving,
    Calories_Per_Serving: recipe.Calories_Per_Serving,
    Protein: recipe.Protein,
    Carbs: recipe.Carbs,
    Fats: recipe.Fats,
    Prep_Time: recipe.Prep_Time,
    Why_It_Fits: recipe.Why_It_Fits,
    Gluten_Free: Boolean(recipe.Gluten_Free),
    Vegetarian: Boolean(recipe.Vegetarian),
    Kosher: Boolean(recipe.Kosher),
    User_ID: recipe.User_ID,
    Created_At: recipe.Created_At,
  };
}

function listRecipesByUser(db, userId, filters = {}) {
  const { mealType, glutenFree, vegetarian, kosher, search } = filters;
  let sql = `SELECT * FROM Recipes WHERE User_ID = ?`;
  const params = [userId];

  if (mealType && mealType !== 'All') {
    sql += ` AND Meal_Type = ?`;
    params.push(mealType);
  }
  if (glutenFree === '1' || glutenFree === true) {
    sql += ` AND Gluten_Free = 1`;
  }
  if (vegetarian === '1' || vegetarian === true) {
    sql += ` AND Vegetarian = 1`;
  }
  if (kosher === '1' || kosher === true) {
    sql += ` AND Kosher = 1`;
  }
  if (search && search.trim()) {
    sql += ` AND (Title LIKE ? OR Source_Ingredients LIKE ? OR Ingredients LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY Created_At DESC, Recipe_ID DESC`;

  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results.map(formatRecipeRow));
    });
  });
}

function getRecipeById(db, recipeId, userId) {
  const sql = `SELECT * FROM Recipes WHERE Recipe_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [recipeId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] ? formatRecipeRow(results[0]) : null);
    });
  });
}

function createRecipe(db, data) {
  const sql = `
    INSERT INTO Recipes (
      Title, Ingredients, Instructions, Calories_Per_Serving,
      User_ID, Meal_Type, Gluten_Free, Vegetarian, Kosher,
      Source_Ingredients, Prep_Time, Protein, Carbs, Fats, Why_It_Fits
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.Title,
    data.Ingredients,
    data.Instructions,
    data.Calories_Per_Serving,
    data.User_ID,
    data.Meal_Type,
    data.Gluten_Free ? 1 : 0,
    data.Vegetarian ? 1 : 0,
    data.Kosher ? 1 : 0,
    data.Source_Ingredients,
    data.Prep_Time || null,
    data.Protein ?? null,
    data.Carbs ?? null,
    data.Fats ?? null,
    data.Why_It_Fits || null,
  ];

  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function updateRecipe(db, recipeId, userId, data) {
  const sql = `UPDATE Recipes SET
    Title = ?, Ingredients = ?, Instructions = ?, Calories_Per_Serving = ?,
    Meal_Type = ?, Gluten_Free = ?, Vegetarian = ?, Kosher = ?,
    Prep_Time = ?, Protein = ?, Carbs = ?, Fats = ?, Why_It_Fits = ?
    WHERE Recipe_ID = ? AND User_ID = ?`;
  const params = [
    data.Title,
    data.Ingredients,
    data.Instructions,
    data.Calories_Per_Serving,
    data.Meal_Type,
    data.Gluten_Free ? 1 : 0,
    data.Vegetarian ? 1 : 0,
    data.Kosher ? 1 : 0,
    data.Prep_Time || null,
    data.Protein ?? null,
    data.Carbs ?? null,
    data.Fats ?? null,
    data.Why_It_Fits || null,
    recipeId,
    userId,
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

function deleteRecipe(db, recipeId, userId) {
  const sql = `DELETE FROM Recipes WHERE Recipe_ID = ? AND User_ID = ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [recipeId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}

module.exports = {
  listRecipesByUser,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  formatRecipeRow,
};
