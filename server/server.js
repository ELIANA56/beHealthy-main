require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
require('./utils/firebaseAdmin'); 


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

    app.use(cors());
    app.use(express.json());

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
        console.log("בקשה הגיעה לנתיב לא קיים:", req.url);
        return res.status(404).json({ error: "נתיב לא נמצא: " + req.url });
    });
    app.listen(config.port || 3001, () => console.log(`Server running on port ${config.port}`));
})();