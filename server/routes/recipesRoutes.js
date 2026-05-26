const express = require('express');
const recipesController = require('../controllers/recipesController');

module.exports = (db, ai) => {
  const router = express.Router();

  // הנתיב הקיים שלך להצגת רשימת מתכונים
  router.get('/recipes', (req, res) => recipesController.listRecipes(req, res, { db }));

  // 🔥 הנתיב החדש והגאוני שהוספנו להמלצה הדינמית מבוססת ג'מיני!
  // אנחנו מעבירים לקונטרולר גם את db וגם את ai שקיבלנו מהשרת
  router.post('/dynamic-recommend', (req, res) => 
    recipesController.getDynamicRecommendation(req, res, { db, ai })
  );

  return router;
};