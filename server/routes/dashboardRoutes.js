const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dès qu'on reçoit l'appel, on lance la fonction du contrôleur
router.get('/stats/:userId', dashboardController.getDashboardData);

module.exports = router;