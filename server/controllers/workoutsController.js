const workoutsModel = require('../models/workoutsModel');
const userModel = require('../models/userModel');
const {
  estimateCaloriesBurned,
  getNutritionAdvice,
  sumTodayNutrition,
  getDailyProteinTarget,
} = require('../services/workoutNutrition');

async function createWorkout(req, res, { db }) {
  try {
    const {
      User_ID,
      Workout_Type,
      Duration,
      Calories_Burned,
      Intensity,
      Notes,
      Log_Date,
    } = req.body;

    if (!User_ID || !Workout_Type || !Duration) {
      return res.status(400).json({ error: 'Workout type and duration are required.' });
    }

    const user = await userModel.getUserProfile(db, User_ID);
    const weight = user?.Weight || 70;
    const intensity = Intensity || 'Moderate';

    let caloriesBurned = Number(Calories_Burned);
    if (!caloriesBurned || caloriesBurned <= 0) {
      caloriesBurned = estimateCaloriesBurned(Workout_Type, Duration, intensity, weight);
    }

    const nutrition = getNutritionAdvice({
      workoutType: Workout_Type,
      duration: Duration,
      caloriesBurned,
      intensity,
    });

    const workoutId = await workoutsModel.createWorkout(db, {
      User_ID,
      Workout_Type,
      Duration,
      Calories_Burned: caloriesBurned,
      Intensity: intensity,
      Notes,
      Extra_Calories: nutrition.extraCaloriesAllowed,
      Extra_Protein: nutrition.extraProteinGrams,
      Log_Date: Log_Date || undefined,
    });

    const saved = await workoutsModel.getWorkoutById(db, workoutId, User_ID);

    res.status(201).json({
      message: 'Workout logged successfully!',
      workout: saved,
      nutrition,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging workout.' });
  }
}

async function getWorkouts(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const results = await workoutsModel.getWorkoutsByUser(db, userId);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching workouts.' });
  }
}

async function getTodaySummary(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const user = await userModel.getUserProfile(db, userId);
    const weight = user?.Weight || 70;
    const workouts = await workoutsModel.getWorkoutsToday(db, userId);
    const totals = sumTodayNutrition(workouts);
    const baseProtein = getDailyProteinTarget(weight);

    res.json({
      ...totals,
      count: workouts.length,
      workouts,
      baseProteinTarget: baseProtein,
      totalProteinTarget: baseProtein + totals.extraProteinGrams,
      adjustedCalorieBudget: (user?.Daily_Calorie_Budget || 2000) + totals.extraCaloriesAllowed,
      baseCalorieBudget: user?.Daily_Calorie_Budget || 2000,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching workout summary.' });
  }
}

async function estimateWorkout(req, res, { db }) {
  try {
    const { userId, type, duration, intensity } = req.query;
    const user = await userModel.getUserProfile(db, userId);
    const weight = user?.Weight || 70;
    const level = intensity || 'Moderate';

    const caloriesBurned = estimateCaloriesBurned(type, duration, level, weight);
    const nutrition = getNutritionAdvice({
      workoutType: type,
      duration,
      caloriesBurned,
      intensity: level,
    });

    res.json({ caloriesBurned, nutrition, weightUsed: weight });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error estimating workout.' });
  }
}

async function updateWorkout(req, res, { db }) {
  try {
    const { workoutId } = req.params;
    const {
      User_ID,
      Workout_Type,
      Duration,
      Calories_Burned,
      Intensity,
      Notes,
    } = req.body;

    if (!User_ID || !Workout_Type || !Duration) {
      return res.status(400).json({ error: 'Workout type and duration are required.' });
    }

    const user = await userModel.getUserProfile(db, User_ID);
    const weight = user?.Weight || 70;
    const intensity = Intensity || 'Moderate';

    let caloriesBurned = Number(Calories_Burned);
    if (!caloriesBurned || caloriesBurned <= 0) {
      caloriesBurned = estimateCaloriesBurned(Workout_Type, Duration, intensity, weight);
    }

    const nutrition = getNutritionAdvice({
      workoutType: Workout_Type,
      duration: Duration,
      caloriesBurned,
      intensity,
    });

    const updated = await workoutsModel.updateWorkout(db, workoutId, User_ID, {
      Workout_Type,
      Duration,
      Calories_Burned: caloriesBurned,
      Intensity: intensity,
      Notes,
      Extra_Calories: nutrition.extraCaloriesAllowed,
      Extra_Protein: nutrition.extraProteinGrams,
    });

    if (!updated) return res.status(404).json({ error: 'Workout not found.' });
    const workout = await workoutsModel.getWorkoutById(db, workoutId, User_ID);
    res.json({ message: 'Workout updated.', workout, nutrition });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating workout.' });
  }
}

async function deleteWorkout(req, res, { db }) {
  try {
    const { workoutId } = req.params;
    const userId = req.query.userId || req.body?.User_ID;
    if (!userId) return res.status(400).json({ error: 'User_ID is required.' });

    const deleted = await workoutsModel.deleteWorkout(db, workoutId, userId);
    if (!deleted) return res.status(404).json({ error: 'Workout not found.' });
    res.json({ message: 'Workout deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting workout.' });
  }
}

module.exports = {
  createWorkout,
  getWorkouts,
  getTodaySummary,
  estimateWorkout,
  updateWorkout,
  deleteWorkout,
};
