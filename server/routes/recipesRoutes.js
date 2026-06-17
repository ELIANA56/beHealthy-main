const express = require('express');
const recipesController = require('../controllers/recipesController');

const db = require('../utils/connection'); // Votre connexion DB
const ai = require('../services/aiService'); // Votre service IA

const router = express.Router();

// Route to fetch recipes
router.get('/recipes', (req, res) => recipesController.listRecipes(req, res, { db }));

// Route to create a recipe
router.post('/recipes', (req, res) => recipesController.createRecipe(req, res, { db }));

module.exports = router;