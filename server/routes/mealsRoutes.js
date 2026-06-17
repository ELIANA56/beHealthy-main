const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');
const db = require('../utils/connection');
const ai = require('../services/aiService');

// Preview analysis only (does not save to database)
router.post('/analyze', (req, res) => mealsController.analyze(req, res));

// Save meal after review or manual entry
router.post('/log', (req, res) => mealsController.logMeal(req, res, { db }));

// Route to fetch meals for a user
router.get('/user/:userId', (req, res) => mealsController.getMeals(req, res, { db }));

module.exports = router;