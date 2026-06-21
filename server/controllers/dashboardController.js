/**
 * קונטרולר דשבורד — מחשב את כל המספרים לדף הבית (Home).
 */
const mealsModel = require('../models/mealsModel');
const userModel = require('../models/userModel');
const workoutsModel = require('../models/workoutsModel');
const { sumTodayNutrition, getDailyProteinTarget } = require('../services/workoutNutrition');
const db = require('../utils/connection');

// GET /api/dashboard/stats/:userId
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId; // מי המשתמש

    // כמה קלוריות וחלבון אכל היום (סכום מכל הארוחות של היום)
    const calories = await mealsModel.getDailyCalories(db, userId);
    const proteinConsumed = await mealsModel.getDailyProtein(db, userId);

    // פרופיל — תקציב יומי בסיסי ומשקל (לחישוב חלבון)
    const user = await userModel.getUserProfile(db, userId);
    const baseBudget = user?.Daily_Calorie_Budget || 2000; // ברירת מחדל 2000 אם חסר
    const weight = user?.Weight || 70;

    // אימונים של היום — מוסיפים בונוס קלוריות (60% ממה שנשרף)
    const workoutsToday = await workoutsModel.getWorkoutsToday(db, userId);
    const workoutTotals = sumTodayNutrition(workoutsToday); // סיכום שריפה + בונוסים
    const adjustedBudget = baseBudget + workoutTotals.extraCaloriesAllowed; // תקציב מעודכן

    const baseProtein = getDailyProteinTarget(weight); // משקל × 1.2 גרם

    // שולחים הכל ל-React ב-JSON אחד
    res.json({
      consumed: Number(calories) || 0, // נאכל היום
      budget: baseBudget, // תקציב בסיס מהפרופיל
      adjustedBudget, // תקציב + בונוס אימון
      workoutBonusCalories: workoutTotals.extraCaloriesAllowed,
      caloriesBurnedToday: workoutTotals.caloriesBurned,
      workoutsToday: workoutTotals.count,
      proteinTarget: baseProtein + workoutTotals.extraProteinGrams, // יעד חלבון כולל אימון
      proteinConsumed: Number(proteinConsumed) || 0,
      baseProteinTarget: baseProtein,
      extraProteinFromWorkout: workoutTotals.extraProteinGrams,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error calculating dashboard stats' });
  }
};
