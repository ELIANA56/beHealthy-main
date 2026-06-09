const express = require('express');
const workoutsController = require('../controllers/workoutsController');
const db = require('../utils/connection'); // Votre connexion DB
const ai = require('../services/aiService'); // Votre service IA
const router = express.Router();

// Route pour récupérer les entraînements
router.get('/workouts', (req, res) => workoutsController.listWorkouts(req, res, { db }));
  router.post('/dynamic-recommend', (req, res) => 
    workoutsController.getDynamicRecommendation(req, res, { db, ai })
  );
module.exports = router;



  
