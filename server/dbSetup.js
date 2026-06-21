/**
 * DB SETUP — יוצר את כל טבלאות behealthydb (הרץ פעם אחת: node dbSetup.js)
 *
 * טבלאות פעילות: Users, Meals_Log, Recipes, Workouts
 * מוחק טבלאות ישנות שלא בשימוש: User_Auth, Content_Hub, Health_Trends
 */
const mysql = require('mysql2');
const config = require('./config');

const OBSOLETE_TABLES = ['User_Auth', 'Content_Hub', 'Health_Trends'];

const SCHEMA = [
  {
    name: 'Users',
    sql: `CREATE TABLE IF NOT EXISTS Users (
      User_ID INT AUTO_INCREMENT PRIMARY KEY,
      Full_Name VARCHAR(50),
      Age INT,
      Weight DECIMAL(5,2),
      Height INT,
      Gender VARCHAR(20),
      Daily_Calorie_Budget INT,
      Goal_Type VARCHAR(50),
      Activity_Factor DECIMAL(4,3) DEFAULT 1.200,
      Email VARCHAR(100) UNIQUE,
      Password_Hash VARCHAR(255),
      Google_ID VARCHAR(128) UNIQUE
    )`,
  },
  {
    name: 'Meals_Log',
    sql: `CREATE TABLE IF NOT EXISTS Meals_Log (
      Meal_ID INT AUTO_INCREMENT PRIMARY KEY,
      User_ID INT NOT NULL,
      Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
      Protein_Grams DECIMAL(5,2) DEFAULT 0,
      Carbs_Grams DECIMAL(5,2) DEFAULT 0,
      Fats_Grams DECIMAL(5,2) DEFAULT 0,
      Total_Calories INT NOT NULL,
      Food_Name VARCHAR(100),
      Description TEXT,
      Log_Date DATE NOT NULL,
      Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`,
  },
  {
    name: 'Recipes',
    sql: `CREATE TABLE IF NOT EXISTS Recipes (
      Recipe_ID INT AUTO_INCREMENT PRIMARY KEY,
      User_ID INT,
      Title VARCHAR(100) NOT NULL,
      Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') DEFAULT 'Lunch',
      Ingredients TEXT,
      Instructions TEXT,
      Calories_Per_Serving INT,
      Gluten_Free TINYINT(1) DEFAULT 0,
      Vegetarian TINYINT(1) DEFAULT 0,
      Kosher TINYINT(1) DEFAULT 0,
      Source_Ingredients TEXT,
      Prep_Time VARCHAR(50),
      Protein DECIMAL(6,2),
      Carbs DECIMAL(6,2),
      Fats DECIMAL(6,2),
      Why_It_Fits TEXT,
      Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`,
  },
  {
    name: 'Workouts',
    sql: `CREATE TABLE IF NOT EXISTS Workouts (
      Workout_ID INT AUTO_INCREMENT PRIMARY KEY,
      User_ID INT NOT NULL,
      Workout_Type VARCHAR(255) NOT NULL,
      Duration INT NOT NULL,
      Calories_Burned INT DEFAULT 0,
      Intensity ENUM('Light', 'Moderate', 'Intense') DEFAULT 'Moderate',
      Notes TEXT,
      Extra_Calories INT DEFAULT 0,
      Extra_Protein INT DEFAULT 0,
      Log_Date DATE NOT NULL,
      Logged_At DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`,
  },
];

function query(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

(async () => {
  const conn = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });

  try {
    await new Promise((resolve, reject) => {
      conn.connect((err) => (err ? reject(err) : resolve()));
    });
    console.log('Connected to MySQL (%s).', config.db.database);

    for (const table of OBSOLETE_TABLES) {
      await query(conn, `DROP TABLE IF EXISTS ${table}`);
      console.log("Dropped obsolete table (if existed): %s", table);
    }

    for (const { name, sql } of SCHEMA) {
      await query(conn, sql);
      console.log("Table '%s' ready.", name);
    }

    console.log('Database setup complete.');
  } catch (err) {
    console.error('dbSetup failed:', err.message);
    process.exitCode = 1;
  } finally {
    conn.end();
  }
})();
