let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ofakim123?",
    database: "behealthydb"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Connected to BeHealthyDB!');

    // 1. Table Users unique (avec email et mot de passe)
    let sqlUsers = `CREATE TABLE IF NOT EXISTS Users (
        User_ID INT AUTO_INCREMENT PRIMARY KEY,
        Full_Name VARCHAR(50),
        Age INT,
        Weight DECIMAL(5,2),
        Height INT,
        Gender VARCHAR(20),
        Daily_Calorie_Budget INT,
        Goal_Type VARCHAR(50),
        Email VARCHAR(100) UNIQUE,
        Password_Hash VARCHAR(255),
        Firebase_UID VARCHAR(128) UNIQUE
    )`;

    con.query(sqlUsers, function(err) {
        if (err) throw err;
        console.log("Table 'Users' created.");

        con.query(
            'ALTER TABLE Users ADD COLUMN Firebase_UID VARCHAR(128) UNIQUE',
            (alterErr) => {
                if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding Firebase_UID:', alterErr);
                }
            }
        );

        // 2. Meals_Log
        let sqlMeals = `CREATE TABLE IF NOT EXISTS Meals_Log (
            Meal_ID INT AUTO_INCREMENT PRIMARY KEY,
            User_ID INT,
            Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
            Protein_Grams DECIMAL(5,2),
            Carbs_Grams DECIMAL(5,2),
            Fats_Grams DECIMAL(5,2),
            Timestamp DATETIME,
            Total_Calories INT,
            Image_Path VARCHAR(255),
            Food_Name VARCHAR(100),
            Description TEXT,
            FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
        )`;
        con.query(sqlMeals, () => {
            console.log("Table 'Meals_Log' created.");

            con.query(
                'ALTER TABLE Meals_Log ADD COLUMN Food_Name VARCHAR(100)',
                (alterErr) => {
                    if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
                        console.error('Error adding Food_Name:', alterErr);
                    }
                }
            );
            con.query(
                'ALTER TABLE Meals_Log ADD COLUMN Description TEXT',
                (alterErr) => {
                    if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
                        console.error('Error adding Description:', alterErr);
                    }
                }
            );

            // 3. Recipes
            let sqlRecipes = `CREATE TABLE IF NOT EXISTS Recipes (
                Recipe_ID INT AUTO_INCREMENT PRIMARY KEY,
                Title VARCHAR(100),
                Ingredients TEXT,
                Instructions TEXT,
                Calories_Per_Serving INT
            )`;
            con.query(sqlRecipes, () => {
                console.log("Table 'Recipes' created.");

                const recipeAlters = [
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
                recipeAlters.forEach((clause) => {
                    con.query(`ALTER TABLE Recipes ${clause}`, (alterErr) => {
                        if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
                            console.error('Recipes alter:', alterErr.message);
                        }
                    });
                });

                // 4. Health_Trends
                let sqlTrends = `CREATE TABLE IF NOT EXISTS Health_Trends (
                    Trend_ID INT AUTO_INCREMENT PRIMARY KEY,
                    User_ID INT,
                    Date DATE,
                    Remaining_Calories INT,
                    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
                )`;
                con.query(sqlTrends, () => {
                    console.log("Table 'Health_Trends' created.");

                    // 5. Workouts
                    let sqlWorkouts = `CREATE TABLE IF NOT EXISTS Workouts (
                        Workout_ID INT AUTO_INCREMENT PRIMARY KEY,
                        User_ID INT,
                        Workout_Type VARCHAR(255),
                        Duration INT,
                        Calories_Burned INT,
                        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
                    )`;
                    con.query(sqlWorkouts, () => {
                        console.log('All tables are ready!');
                        con.end(); // Close connection at the very end
                    });
                });
            });
        });
    });
});