const RECIPE_COLUMNS = [
  'ADD COLUMN User_ID INT',
  "ADD COLUMN Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack')",
  'ADD COLUMN Gluten_Free TINYINT(1) DEFAULT 0',
  'ADD COLUMN Vegetarian TINYINT(1) DEFAULT 0',
  'ADD COLUMN Kosher TINYINT(1) DEFAULT 0',
  'ADD COLUMN Source_Ingredients TEXT',
  'ADD COLUMN Prep_Time VARCHAR(50)',
  'ADD COLUMN Protein DECIMAL(6,2)',
  'ADD COLUMN Carbs DECIMAL(6,2)',
  'ADD COLUMN Fats DECIMAL(6,2)',
  'ADD COLUMN Why_It_Fits TEXT',
  'ADD COLUMN Created_At DATETIME DEFAULT CURRENT_TIMESTAMP',
];

function migrateRecipesSchema(db) {
  return new Promise((resolve) => {
    let pending = RECIPE_COLUMNS.length;
    if (pending === 0) return resolve();

    RECIPE_COLUMNS.forEach((clause) => {
      db.query(`ALTER TABLE Recipes ${clause}`, (err) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') {
          console.error('Recipes migration:', err.message);
        }
        pending -= 1;
        if (pending === 0) resolve();
      });
    });
  });
}

module.exports = { migrateRecipesSchema };
