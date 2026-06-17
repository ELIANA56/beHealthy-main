const recipesModel = require('../models/recipesModel');
const mealsModel = require('../models/mealsModel');
const userModel = require('../models/userModel');
const workoutsModel = require('../models/workoutsModel');
const aiService = require('../services/aiService');
const { sumTodayNutrition } = require('../services/workoutNutrition');

async function getAdjustedDailyBudget(db, userId) {
  const user = await userModel.getUserProfile(db, userId);
  const base = user?.Daily_Calorie_Budget || 2000;
  const workouts = await workoutsModel.getWorkoutsToday(db, userId);
  const bonus = sumTodayNutrition(workouts).extraCaloriesAllowed;
  return { base, bonus, adjusted: base + bonus };
}

exports.listUserRecipes = async (req, res, context) => {
  const { db } = context;
  const { userId } = req.params;
  const { mealType, glutenFree, vegetarian, kosher, search } = req.query;

  try {
    const recipes = await recipesModel.listRecipesByUser(db, userId, {
      mealType,
      glutenFree,
      vegetarian,
      kosher,
      search,
    });
    return res.json(recipes);
  } catch (err) {
    console.error('Error listing user recipes:', err);
    return res.status(500).json({ error: 'Error fetching recipes' });
  }
};

exports.getRecipe = async (req, res, context) => {
  const { db } = context;
  const { userId, recipeId } = req.params;

  try {
    const recipe = await recipesModel.getRecipeById(db, recipeId, userId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });
    return res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err);
    return res.status(500).json({ error: 'Error fetching recipe' });
  }
};

exports.getMealBudget = async (req, res, context) => {
  const { db } = context;
  const { userId, mealType } = req.params;

  try {
    const { adjusted } = await getAdjustedDailyBudget(db, userId);
    const budget = await mealsModel.getMealCalorieBudget(db, userId, mealType, adjusted);
    return res.json(budget);
  } catch (err) {
    console.error('Error fetching meal budget:', err);
    return res.status(500).json({ error: 'Error calculating meal calorie budget' });
  }
};

exports.generateFromFridge = async (req, res, context) => {
  const { db } = context;
  const {
    User_ID,
    Meal_Type,
    Ingredients,
    Dietary,
    Extra_Notes,
    Target_Calories,
  } = req.body;

  if (!User_ID) return res.status(400).json({ error: 'User_ID is required.' });
  if (!Meal_Type) return res.status(400).json({ error: 'Meal_Type is required.' });
  if (!Array.isArray(Ingredients) || Ingredients.length === 0) {
    return res.status(400).json({ error: 'Select at least one ingredient from your fridge.' });
  }

  try {
    const { adjusted } = await getAdjustedDailyBudget(db, User_ID);
    const budget = await mealsModel.getMealCalorieBudget(db, User_ID, Meal_Type, adjusted);

    let targetCalories = Number(Target_Calories) || budget.remaining;
    if (targetCalories <= 0) {
      targetCalories = Math.max(Math.round(budget.mealBudget * 0.5), 150);
    }

    const dietary = {
      glutenFree: Boolean(Dietary?.glutenFree),
      vegetarian: Boolean(Dietary?.vegetarian),
      kosher: Boolean(Dietary?.kosher),
    };

    const recipeData = await aiService.generateFridgeRecipe({
      targetCalories,
      ingredients: Ingredients,
      mealType: Meal_Type,
      dietary,
      extraNotes: Extra_Notes || '',
    });

    if (!recipeData || !recipeData.Recipe_Name) {
      return res.status(500).json({ error: 'Unable to generate a valid recipe from AI.' });
    }

    const result = await recipesModel.createRecipe(db, {
      Title: recipeData.Recipe_Name,
      Ingredients: JSON.stringify(recipeData.Ingredients || []),
      Instructions: JSON.stringify(recipeData.Instructions || []),
      Calories_Per_Serving: recipeData.Calories || targetCalories,
      User_ID: User_ID,
      Meal_Type: Meal_Type,
      Gluten_Free: dietary.glutenFree,
      Vegetarian: dietary.vegetarian,
      Kosher: dietary.kosher,
      Source_Ingredients: JSON.stringify(Ingredients),
      Prep_Time: recipeData.Prep_Time || null,
      Protein: recipeData.Protein ?? null,
      Carbs: recipeData.Carbs ?? null,
      Fats: recipeData.Fats ?? null,
      Why_It_Fits: recipeData.Why_It_Fits || null,
    });

    const saved = await recipesModel.getRecipeById(db, result.insertId, User_ID);
    return res.json({ ...saved, mealBudget: budget });
  } catch (error) {
    console.error('Error generating fridge recipe:', error);
    return res.status(500).json({ error: error.message || 'Error generating recipe' });
  }
};

exports.getDynamicRecommendation = exports.generateFromFridge;

exports.updateRecipe = async (req, res, context) => {
  const { db } = context;
  const { userId, recipeId } = req.params;
  const {
    Title,
    Meal_Type,
    Ingredients,
    Instructions,
    Calories_Per_Serving,
    Gluten_Free,
    Vegetarian,
    Kosher,
    Prep_Time,
    Protein,
    Carbs,
    Fats,
    Why_It_Fits,
  } = req.body;

  if (!Title?.trim()) return res.status(400).json({ error: 'Recipe title is required.' });

  try {
    const ingredientsJson = Array.isArray(Ingredients)
      ? JSON.stringify(Ingredients)
      : JSON.stringify(String(Ingredients || '').split('\n').map((s) => s.trim()).filter(Boolean));
    const instructionsJson = Array.isArray(Instructions)
      ? JSON.stringify(Instructions)
      : JSON.stringify(String(Instructions || '').split('\n').map((s) => s.trim()).filter(Boolean));

    const updated = await recipesModel.updateRecipe(db, recipeId, userId, {
      Title: Title.trim(),
      Ingredients: ingredientsJson,
      Instructions: instructionsJson,
      Calories_Per_Serving: Number(Calories_Per_Serving) || 0,
      Meal_Type: Meal_Type || 'Lunch',
      Gluten_Free: Boolean(Gluten_Free),
      Vegetarian: Boolean(Vegetarian),
      Kosher: Boolean(Kosher),
      Prep_Time,
      Protein,
      Carbs,
      Fats,
      Why_It_Fits,
    });

    if (!updated) return res.status(404).json({ error: 'Recipe not found.' });
    const recipe = await recipesModel.getRecipeById(db, recipeId, userId);
    return res.json({ message: 'Recipe updated.', recipe });
  } catch (err) {
    console.error('Error updating recipe:', err);
    return res.status(500).json({ error: 'Error updating recipe.' });
  }
};

exports.deleteRecipe = async (req, res, context) => {
  const { db } = context;
  const { userId, recipeId } = req.params;

  try {
    const deleted = await recipesModel.deleteRecipe(db, recipeId, userId);
    if (!deleted) return res.status(404).json({ error: 'Recipe not found.' });
    return res.json({ message: 'Recipe deleted.' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    return res.status(500).json({ error: 'Error deleting recipe.' });
  }
};
