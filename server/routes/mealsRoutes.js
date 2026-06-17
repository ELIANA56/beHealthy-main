const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');
const db = require('../utils/connection');
const ai = require('../services/aiService');

// Route to analyze a meal
router.post('/analyze', (req, res) => mealsController.analyze(req, res, { db, ai }));

// Route to fetch meals for a user
router.get('/user/:userId', (req, res) => mealsController.getMeals(req, res, { db }));

module.exports = router;