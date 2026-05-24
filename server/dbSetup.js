let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ofakim123?",
    database: "BeHealthyDB"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à BeHealthyDB !");

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
        Password_Hash VARCHAR(255)
    )`;

    con.query(sqlUsers, function(err) {
        if (err) throw err;
        console.log("Table 'Users' créée.");

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
            FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
        )`;
        con.query(sqlMeals, () => {
            console.log("Table 'Meals_Log' créée.");

            // 3. Recipes
            let sqlRecipes = `CREATE TABLE IF NOT EXISTS Recipes (
                Recipe_ID INT AUTO_INCREMENT PRIMARY KEY,
                Title VARCHAR(100),
                Ingredients TEXT,
                Instructions TEXT,
                Calories_Per_Serving INT
            )`;
            con.query(sqlRecipes, () => {
                console.log("Table 'Recipes' créée.");

                // 4. Health_Trends
                let sqlTrends = `CREATE TABLE IF NOT EXISTS Health_Trends (
                    Trend_ID INT AUTO_INCREMENT PRIMARY KEY,
                    User_ID INT,
                    Date DATE,
                    Remaining_Calories INT,
                    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
                )`;
                con.query(sqlTrends, () => {
                    console.log("Table 'Health_Trends' créée.");

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
                        console.log("Toutes les tables sont prêtes !");
                        con.end(); // On ferme la connexion à la toute fin
                    });
                });
            });
        });
    });
});