const mealsModel = require('../models/mealsModel');
const aiService = require('../services/aiService');

async function analyze(req, res, { db, ai }) {
  try {
    const { User_ID, Meal_Type, Image_Base64 } = req.body;
    if (!User_ID) return res.status(400).json({ error: 'User_ID is required.' });
    if (!Image_Base64) return res.status(400).json({ error: 'Please provide an image of your meal.' });

    const mealAnalysis = await aiService.analyzeMeal(Image_Base64);
    const {
      Protein_Grams,
      Carbs_Grams,
      Fats_Grams,
      Total_Calories,
      Meal_Name,
      Description,
      Ingredients,
    } = mealAnalysis || {};

    const descriptionText = [
      Description,
      Array.isArray(Ingredients) && Ingredients.length
        ? `Ingredients: ${Ingredients.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const mealId = await mealsModel.insertMeal(db, {
      User_ID,
      Meal_Type: Meal_Type || 'Lunch',
      Protein_Grams,
      Carbs_Grams,
      Fats_Grams,
      Total_Calories,
      Food_Name: Meal_Name,
      Description: descriptionText,
    });
    res.status(201).json({ message: 'Meal analyzed and logged successfully!', mealId, analysis: mealAnalysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze meal image.' });
  }
}

async function getMeals(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const results = await mealsModel.getMealsByUser(db, userId);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching meals.' });
  }
}


module.exports = { analyze, getMeals };
