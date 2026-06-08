const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');
const db = require('../utils/connection'); // Votre connexion DB
const ai = require('../services/aiService'); // Votre service IA

// Route pour analyser un repas
router.post('/analyze', (req, res) => mealsController.analyze(req, res, { db, ai }));

// Route pour récupérer les repas
router.get('/user/:userId', (req, res) => mealsController.getMeals(req, res, { db }));

module.exports = router;