require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const config = require('./config');
const aiService = require('./services/aiService');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const mealsRoutes = require('./routes/mealsRoutes');
const workoutsRoutes = require('./routes/workoutsRoutes');
const recipesRoutes = require('./routes/recipesRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

(async () => {
    const app = express();

    // 1. Middlewares de base (DOIVENT être en haut)
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 2. Logging (pour voir les requêtes dans le terminal immédiatement)
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });

    // 3. Initialisation IA
    let ai = null;
    try {
        ai = await aiService.initAI();
    } catch (e) {
        console.warn('[WARN] aiService.initAI() failed, using internal mock.');
        ai = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => JSON.stringify({ Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 }) } }) }) };
    }

    // 4. Initialisation DB
    const dbConfig = config.db || {};
    const db = mysql.createConnection({
        host: dbConfig.host || 'localhost',
        user: dbConfig.user || 'behealthy',
        password: dbConfig.password || '',
        database: dbConfig.database || 'behealthydb'
    });

    db.connect((err) => {
        if (err) console.error('Error connecting to DB:', err.message);
        else console.log('Connected to BeHealthyDB successfully!');
    });

    // 5. Injection des dépendances pour les routes
    app.locals.ai = ai;
    app.locals.db = db;

   // 6. Montage des routes existantes
   app.use('/api/auth', authRoutes(db, ai));
   app.use('/api/meals', mealsRoutes(db, ai));
   app.use('/api/workouts', workoutsRoutes(db, ai));
   app.use('/api/recipes', recipesRoutes(db, ai));
   app.use('/api/articles', articlesRoutes(db, ai));
   app.use('/api/dashboard', dashboardRoutes);

   // --- PLACEZ LA NOUVELLE ROUTE ICI ---
   app.get('/api/user/:id', (req, res) => {
       const userId = req.params.id;
       const sql = "SELECT Full_Name, Age, Weight, Height, Goal_Type, Gender, Email FROM Users WHERE User_ID = ?";
       
       db.query(sql, [userId], (err, results) => {
           if (err) return res.status(500).json({ error: "Erreur serveur" });
           if (results.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });
           res.json(results[0]);
       });
   });

   // 7. Gestion des routes inexistantes (DOIT TOUJOURS ÊTRE EN DERNIER)
   app.use((req, res) => {
       res.status(404).json({ error: "Route non trouvée" });
   });

   const port = config.port || 3001;
    app.listen(port, () => console.log(`Server running on port ${port}`));

})(); 