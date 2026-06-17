const GOAL_ADJUSTMENTS = {
  הרזיה: -500,
  'Weight loss': -500,
  מסה: 300,
  'Mass gain': 300,
  Bulk: 300,
  תחזוקה: 0,
  Maintenance: 0,
};

function goalAdjustment(goalType) {
  if (!goalType) return 0;
  if (GOAL_ADJUSTMENTS[goalType] !== undefined) return GOAL_ADJUSTMENTS[goalType];
  const g = String(goalType).toLowerCase();
  if (/loss|הרז|cut|deficit/.test(g)) return -500;
  if (/mass|bulk|מסה|gain|surplus/.test(g)) return 300;
  return 0;
}

function calculateDailyCalorieBudget({ Age, Weight, Height, Gender, Activity_Factor, Goal_Type }) {
  const ageNum = Number(Age);
  const weightKg = Number(Weight) || 0;
  const heightCm = Number(Height) || 0;
  const actFactor = Number(Activity_Factor) || 1.2;

  if (!ageNum || !weightKg || !heightCm) return null;

  const isFemale = Gender && /f|female|נ/i.test(String(Gender));
  const bmr = isFemale
    ? 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;

  const tdee = Math.round(bmr * actFactor);
  const adjusted = tdee + goalAdjustment(Goal_Type);
  return Math.max(1200, adjusted);
}

module.exports = { calculateDailyCalorieBudget, goalAdjustment };
