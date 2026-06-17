require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
require('./utils/firebaseAdmin');
const db = require('./utils/connection');
const { migrateRecipesSchema } = require('./utils/migrateRecipes');
const { migrateWorkoutsSchema } = require('./utils/migrateWorkouts');
const { migrateMealsSchema } = require('./utils/migrateMeals');
const { migrateUsersSchema } = require('./utils/migrateUsers');


// Import des routes
const authRoutes = require('./routes/authRoutes');
const mealsRoutes = require('./routes/mealsRoutes');
const workoutsRoutes = require('./routes/workoutsRoutes');
const recipesRoutes = require('./routes/recipesRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');


(async () => {
    const app = express();

    await migrateRecipesSchema(db);
    await migrateWorkoutsSchema(db);
    await migrateMealsSchema(db);
    await migrateUsersSchema(db);

    app.use(cors());
    app.use(express.json({ limit: '15mb' }));

    // Logging
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/meals', mealsRoutes);
    app.use('/api/workouts', workoutsRoutes);
    app.use('/api/recipes', recipesRoutes);
    app.use('/api/articles', articlesRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/user', userRoutes);

    // 404
    app.use((req, res) => {
        console.log('Request reached unknown route:', req.url);
        return res.status(404).json({ error: 'Route not found: ' + req.url });
    });
    app.listen(config.port || 3001, () => console.log(`Server running on port ${config.port}`));
})();