const mealsModel = require('../models/mealsModel');
const userModel = require('../models/userModel');
const db = require('../utils/connection');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Fetch user's calories consumed today and daily budget
        const calories = await mealsModel.getDailyCalories(db, userId);
        const user = await userModel.getUserProfile(db, userId);

        res.json({
            consumed: calories,
            budget: user.Daily_Calorie_Budget || 2000 // Default value
        });
    } catch (err) {
        res.status(500).json({ error: 'Error calculating dashboard stats' });
    }
};