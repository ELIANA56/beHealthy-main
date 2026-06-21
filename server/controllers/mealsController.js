/**
 * קונטרולר ארוחות — ניתוח תמונות עם AI, שמירה, עריכה ומחיקה של ארוחות.
 */
const mealsModel = require('../models/mealsModel'); // שאילתות SQL לטבלת הארוחות
const aiService = require('../services/aiService'); // קריאה ל-Gemini AI

// בודק אם ה-AI לא הצליח לזהות כלום (כל הערכים 0)
function isEmptyAnalysis(analysis) {
  if (!analysis) return true; // אין תוצאה בכלל
  return (
    Number(analysis.Total_Calories) === 0 &&
    Number(analysis.Protein_Grams) === 0 &&
    Number(analysis.Carbs_Grams) === 0 &&
    Number(analysis.Fats_Grams) === 0
  );
}

// מחבר תיאור + רשימת מצרכים לשדה אחד ב-DB
function buildDescription({ Description, Ingredients }) {
  return [
    Description,
    Array.isArray(Ingredients) && Ingredients.length
      ? `Ingredients: ${Ingredients.join(', ')}`
      : null,
  ]
    .filter(Boolean) // מסיר ערכים ריקים
    .join(' | '); // מחבר עם |
}

// POST /api/meals/analyze — ניתוח תמונה בלבד (לא שומר!)
async function analyze(req, res) {
  try {
    const { Image_Base64, Image_Mime_Type } = req.body; // התמונה מגיעה כ-base64 מהדפדפן
    if (!Image_Base64) return res.status(400).json({ error: 'Please provide an image of your meal.' });

    // שולחים ל-AI ומקבלים הערכת קלוריות/חלבון/פחמימות/שומן
    const mealAnalysis = await aiService.analyzeMeal(Image_Base64, Image_Mime_Type || 'image/jpeg');

    res.json({
      message: isEmptyAnalysis(mealAnalysis)
        ? 'Could not detect nutrition from this image. Please enter values manually.'
        : 'Analysis complete. Review and save your meal.',
      analysis: mealAnalysis, // התוצאה שהמשתמש יראה ויאשר
      needsManual: isEmptyAnalysis(mealAnalysis), // true = צריך למלא ידנית
    });
  } catch (error) {
    console.error('Meal analysis error:', error);
    const message = error.message || 'Failed to analyze meal image.';
    const status = message.includes('API key') ? 503 : 500; // 503 אם חסר מפתח AI
    res.status(status).json({ error: message });
  }
}

// POST /api/meals/log — שמירת ארוחה ל-DB
async function logMeal(req, res, { db }) {
  try {
    // שולפים את כל השדות מהבקשה
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
      Log_Date,
    } = req.body;

    // ולידציה — חובה userId, שם, וקלוריות חיוביות
    if (!User_ID) return res.status(400).json({ error: 'User_ID is required.' });
    if (!Meal_Name?.trim()) return res.status(400).json({ error: 'Meal name is required.' });
    if (Number(Total_Calories) <= 0) {
      return res.status(400).json({ error: 'Calories must be greater than 0.' });
    }

    const mealType = Meal_Type || 'Lunch'; // ברירת מחדל: צהריים
    const logDate = Log_Date || new Date().toISOString().slice(0, 10); // תאריך היום YYYY-MM-DD

    // בדיקה: האם כבר נרשמה ארוחה מסוג זה היום? (חוץ מ-Snack)
    const check = await mealsModel.canLogMealType(db, User_ID, mealType, logDate);
    if (!check.allowed) return res.status(400).json({ error: check.error });

    const descriptionText = buildDescription({
      Description,
      Ingredients: typeof Ingredients === 'string'
        ? Ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : Ingredients,
    });

    // INSERT לטבלת Meals_Log
    const mealId = await mealsModel.insertMeal(db, {
      User_ID,
      Meal_Type: mealType,
      Protein_Grams: Number(Protein_Grams) || 0,
      Carbs_Grams: Number(Carbs_Grams) || 0,
      Fats_Grams: Number(Fats_Grams) || 0,
      Total_Calories: Number(Total_Calories),
      Food_Name: Meal_Name.trim(),
      Description: descriptionText || null,
      Log_Date: logDate,
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

// GET /api/meals/user/:userId — כל הארוחות של המשתמש
async function getMeals(req, res, { db }) {
  try {
    const userId = req.params.userId; // מזהה מה-URL
    const results = await mealsModel.getMealsByUser(db, userId);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching meals.' });
  }
}

// GET /api/meals/today-types/:userId — אילו סוגי ארוחות כבר נרשמו היום
async function getTodayMealTypes(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const logDate = req.query.date || new Date().toISOString().slice(0, 10); // אפשר ?date=2026-06-17
    const logged = await mealsModel.getMainMealsLoggedOnDate(db, userId, logDate);
    res.json({
      date: logDate,
      logged: logged.map((m) => m.Meal_Type), // רק שמות הסוגים — ל-UI
      meals: logged, // האובייקטים המלאים
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching today meal types.' });
  }
}

// PUT /api/meals/:mealId — עריכת ארוחה קיימת
async function updateMeal(req, res, { db }) {
  try {
    const { mealId } = req.params; // מזהה הארוחה מה-URL
    const {
      User_ID,
      Meal_Type,
      Meal_Name,
      Description,
      Protein_Grams,
      Carbs_Grams,
      Fats_Grams,
      Total_Calories,
    } = req.body;

    if (!User_ID) return res.status(400).json({ error: 'User_ID is required.' });
    if (!Meal_Name?.trim()) return res.status(400).json({ error: 'Meal name is required.' });
    if (Number(Total_Calories) <= 0) {
      return res.status(400).json({ error: 'Calories must be greater than 0.' });
    }

    const existing = await mealsModel.getMealById(db, mealId, User_ID);
    if (!existing) return res.status(404).json({ error: 'Meal not found.' });

    const mealType = Meal_Type || 'Lunch';
    const logDate = existing.Log_Date
      ? String(existing.Log_Date).slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    // בדיקה שוב — אולי משנים סוג ארוחה; mealId מוחרג מהבדיקה (עריכה של אותה רשומה)
    const check = await mealsModel.canLogMealType(db, User_ID, mealType, logDate, mealId);
    if (!check.allowed) return res.status(400).json({ error: check.error });

    const updated = await mealsModel.updateMeal(db, mealId, User_ID, {
      Meal_Type: mealType,
      Protein_Grams: Number(Protein_Grams) || 0,
      Carbs_Grams: Number(Carbs_Grams) || 0,
      Fats_Grams: Number(Fats_Grams) || 0,
      Total_Calories: Number(Total_Calories),
      Food_Name: Meal_Name.trim(),
      Description: Description || null,
    });

    if (!updated) return res.status(404).json({ error: 'Meal not found.' });
    const meal = await mealsModel.getMealById(db, mealId, User_ID);
    res.json({ message: 'Meal updated.', meal });
  } catch (error) {
    console.error('Meal update error:', error);
    res.status(500).json({ error: 'Failed to update meal.' });
  }
}

// DELETE /api/meals/:mealId — מחיקת ארוחה
async function deleteMeal(req, res, { db }) {
  try {
    const { mealId } = req.params;
    const userId = req.query.userId || req.body?.User_ID; // userId מה-query או מה-body
    if (!userId) return res.status(400).json({ error: 'User_ID is required.' });

    const deleted = await mealsModel.deleteMeal(db, mealId, userId);
    if (!deleted) return res.status(404).json({ error: 'Meal not found.' });
    res.json({ message: 'Meal deleted.' });
  } catch (error) {
    console.error('Meal delete error:', error);
    res.status(500).json({ error: 'Failed to delete meal.' });
  }
}

module.exports = { analyze, logMeal, getMeals, getTodayMealTypes, updateMeal, deleteMeal };
