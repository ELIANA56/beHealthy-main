const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// When a request is received, run the controller function
router.get('/stats/:userId', dashboardController.getDashboardData);

module.exports = router;