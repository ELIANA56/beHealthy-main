const mealsModel = require('../models/mealsModel');
const userModel = require('../models/userModel');
const db = require('../utils/connection');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // On récupère les calories et le budget quotidien de l'utilisateur
        const calories = await mealsModel.getDailyCalories(db, userId);
        const user = await userModel.getUserProfile(db, userId);
        
        res.json({
            consumed: calories,
            budget: user.Daily_Calorie_Budget || 2000 // Valeur par défaut
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du calcul des stats" });
    }
};