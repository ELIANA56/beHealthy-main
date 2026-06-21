/** RECIPES ROUTES — /api/recipes/* — AI generate, save, list, update, delete */
const express = require('express');
const recipesController = require('../controllers/recipesController');
const db = require('../utils/connection');
const ai = require('../services/aiService');

const router = express.Router();

router.get('/user/:userId', (req, res) =>
  recipesController.listUserRecipes(req, res, { db })
);

router.get('/user/:userId/:recipeId', (req, res) =>
  recipesController.getRecipe(req, res, { db })
);

router.get('/budget/:userId/:mealType', (req, res) =>
  recipesController.getMealBudget(req, res, { db })
);

router.post('/generate', (req, res) =>
  recipesController.generateFromFridge(req, res, { db, ai })
);

router.put('/user/:userId/:recipeId', (req, res) =>
  recipesController.updateRecipe(req, res, { db })
);

router.delete('/user/:userId/:recipeId', (req, res) =>
  recipesController.deleteRecipe(req, res, { db })
);

module.exports = router;
