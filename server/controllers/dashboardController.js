const mealsModel = require('../models/mealsModel');
const userModel = require('../models/userModel');
const workoutsModel = require('../models/workoutsModel');
const { sumTodayNutrition, getDailyProteinTarget } = require('../services/workoutNutrition');
const db = require('../utils/connection');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    const calories = await mealsModel.getDailyCalories(db, userId);
    const proteinConsumed = await mealsModel.getDailyProtein(db, userId);
    const user = await userModel.getUserProfile(db, userId);
    const baseBudget = user?.Daily_Calorie_Budget || 2000;
    const weight = user?.Weight || 70;

    const workoutsToday = await workoutsModel.getWorkoutsToday(db, userId);
    const workoutTotals = sumTodayNutrition(workoutsToday);
    const adjustedBudget = baseBudget + workoutTotals.extraCaloriesAllowed;
    const baseProtein = getDailyProteinTarget(weight);

    res.json({
      consumed: Number(calories) || 0,
      budget: baseBudget,
      adjustedBudget,
      workoutBonusCalories: workoutTotals.extraCaloriesAllowed,
      caloriesBurnedToday: workoutTotals.caloriesBurned,
      workoutsToday: workoutTotals.count,
      proteinTarget: baseProtein + workoutTotals.extraProteinGrams,
      proteinConsumed: Number(proteinConsumed) || 0,
      baseProteinTarget: baseProtein,
      extraProteinFromWorkout: workoutTotals.extraProteinGrams,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error calculating dashboard stats' });
  }
};
