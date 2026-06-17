const express = require('express');
const workoutsController = require('../controllers/workoutsController');
const db = require('../utils/connection');

const router = express.Router();

router.get('/user/:userId', (req, res) => workoutsController.getWorkouts(req, res, { db }));
router.post('/', (req, res) => workoutsController.createWorkout(req, res, { db }));

module.exports = router;
