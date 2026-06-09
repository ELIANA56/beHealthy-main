const express = require('express');
const recipesController = require('../controllers/recipesController');

const db = require('../utils/connection'); // Votre connexion DB
const ai = require('../services/aiService'); // Votre service IA

const router = express.Router();

// Route pour récupérer les recettes
router.get('/recipes', (req, res) => recipesController.listRecipes(req, res, { db }));

// Route pour créer une recette
router.post('/recipes', (req, res) => recipesController.createRecipe(req, res, { db }));

module.exports = router;