const MET_VALUES = {
  Walking: { Light: 2.5, Moderate: 3.5, Intense: 4.5 },
  Running: { Light: 7, Moderate: 9.8, Intense: 11.5 },
  Cycling: { Light: 4, Moderate: 6.8, Intense: 10 },
  Swimming: { Light: 5, Moderate: 7, Intense: 9 },
  Gym: { Light: 3.5, Moderate: 5, Intense: 6.5 },
  Yoga: { Light: 2, Moderate: 3, Intense: 4 },
  Other: { Light: 3, Moderate: 5, Intense: 7 },
};

function estimateCaloriesBurned(workoutType, durationMin, intensity, weightKg = 70) {
  const type = MET_VALUES[workoutType] ? workoutType : 'Other';
  const level = MET_VALUES[type][intensity] ? intensity : 'Moderate';
  const met = MET_VALUES[type][level];
  const hours = Number(durationMin) / 60;
  return Math.round(met * Number(weightKg) * hours);
}

function getNutritionAdvice({ workoutType, duration, caloriesBurned, intensity }) {
  const burned = Number(caloriesBurned) || 0;
  const mins = Number(duration) || 0;

  // Eat back ~60% of burned calories — enough to refuel without canceling the workout
  const extraCaloriesAllowed = Math.round(burned * 0.6);

  let extraProteinGrams = 15;
  if (workoutType === 'Gym') extraProteinGrams = 30;
  else if (['Running', 'Cycling', 'Swimming'].includes(workoutType)) extraProteinGrams = 20;
  else if (['Walking', 'Yoga'].includes(workoutType)) extraProteinGrams = 12;

  if (intensity === 'Intense') extraProteinGrams += 8;
  if (intensity === 'Light') extraProteinGrams -= 4;

  extraProteinGrams = Math.round(extraProteinGrams * Math.min(Math.max(mins / 30, 0.5), 2));

  const tips = [];
  if (burned > 0) {
    tips.push(`You can add about ${extraCaloriesAllowed} kcal to your food today.`);
  }
  if (extraProteinGrams > 0) {
    tips.push(`Aim for ~${extraProteinGrams}g extra protein to help muscle recovery.`);
  }

  return {
    extraCaloriesAllowed,
    extraProteinGrams,
    tip: tips.join(' '),
  };
}

function sumTodayNutrition(workouts) {
  const result = workouts.reduce(
    (acc, w) => {
      acc.caloriesBurned += Number(w.Calories_Burned) || 0;
      acc.extraCaloriesAllowed += Number(w.Extra_Calories) || 0;
      acc.extraProteinGrams += Number(w.Extra_Protein) || 0;
      acc.totalMinutes += Number(w.Duration) || 0;
      return acc;
    },
    { caloriesBurned: 0, extraCaloriesAllowed: 0, extraProteinGrams: 0, totalMinutes: 0 }
  );
  result.count = workouts.length;
  return result;
}

function getDailyProteinTarget(weightKg = 70) {
  return Math.round(Number(weightKg) * 1.2);
}

module.exports = {
  estimateCaloriesBurned,
  getNutritionAdvice,
  sumTodayNutrition,
  getDailyProteinTarget,
};
