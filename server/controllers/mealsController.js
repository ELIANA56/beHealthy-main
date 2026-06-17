const mealsModel = require('../models/mealsModel');
const aiService = require('../services/aiService');

function isEmptyAnalysis(analysis) {
  if (!analysis) return true;
  return (
    Number(analysis.Total_Calories) === 0 &&
    Number(analysis.Protein_Grams) === 0 &&
    Number(analysis.Carbs_Grams) === 0 &&
    Number(analysis.Fats_Grams) === 0
  );
}

function buildDescription({ Description, Ingredients }) {
  return [
    Description,
    Array.isArray(Ingredients) && Ingredients.length
      ? `Ingredients: ${Ingredients.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join(' | ');
}

async function analyze(req, res) {
  try {
    const { Image_Base64, Image_Mime_Type } = req.body;
    if (!Image_Base64) return res.status(400).json({ error: 'Please provide an image of your meal.' });

    const mealAnalysis = await aiService.analyzeMeal(Image_Base64, Image_Mime_Type || 'image/jpeg');

    res.json({
      message: isEmptyAnalysis(mealAnalysis)
        ? 'Could not detect nutrition from this image. Please enter values manually.'
        : 'Analysis complete. Review and save your meal.',
      analysis: mealAnalysis,
      needsManual: isEmptyAnalysis(mealAnalysis),
    });
  } catch (error) {
    console.error('Meal analysis error:', error);
    const message = error.message || 'Failed to analyze meal image.';
    const status = message.includes('API key') ? 503 : 500;
    res.status(status).json({ error: message });
  }
}

async function logMeal(req, res, { db }) {
  try {
    const {
      User_ID,
      Meal_Type,
      Meal_Name,
      Description,
      Protein_Grams,
      Carbs_Grams,
      Fats_Grams,
      Total_Calories,
      Ingredients,
    } = req.body;

    if (!User_ID) return res.status(400).json({ error: 'User_ID is required.' });
    if (!Meal_Name?.trim()) return res.status(400).json({ error: 'Meal name is required.' });
    if (Number(Total_Calories) <= 0) {
      return res.status(400).json({ error: 'Calories must be greater than 0.' });
    }

    const descriptionText = buildDescription({
      Description,
      Ingredients: typeof Ingredients === 'string'
        ? Ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : Ingredients,
    });

    const mealId = await mealsModel.insertMeal(db, {
      User_ID,
      Meal_Type: Meal_Type || 'Lunch',
      Protein_Grams: Number(Protein_Grams) || 0,
      Carbs_Grams: Number(Carbs_Grams) || 0,
      Fats_Grams: Number(Fats_Grams) || 0,
      Total_Calories: Number(Total_Calories),
      Food_Name: Meal_Name.trim(),
      Description: descriptionText || null,
    });

    res.status(201).json({
      message: 'Meal saved successfully!',
      mealId,
      analysis: {
        Meal_Name: Meal_Name.trim(),
        Description,
        Protein_Grams: Number(Protein_Grams) || 0,
        Carbs_Grams: Number(Carbs_Grams) || 0,
        Fats_Grams: Number(Fats_Grams) || 0,
        Total_Calories: Number(Total_Calories),
        Ingredients: Ingredients || [],
      },
    });
  } catch (error) {
    console.error('Meal log error:', error);
    res.status(500).json({ error: 'Failed to save meal.' });
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


module.exports = { analyze, logMeal, getMeals };
