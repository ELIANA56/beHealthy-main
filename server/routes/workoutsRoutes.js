const express = require('express');
const workoutsController = require('../controllers/workoutsController');
const db = require('../utils/connection');

const router = express.Router();

router.get('/user/:userId', (req, res) => workoutsController.getWorkouts(req, res, { db }));
router.get('/today/:userId', (req, res) => workoutsController.getTodaySummary(req, res, { db }));
router.get('/estimate', (req, res) => workoutsController.estimateWorkout(req, res, { db }));
router.post('/', (req, res) => workoutsController.createWorkout(req, res, { db }));
router.put('/:workoutId', (req, res) => workoutsController.updateWorkout(req, res, { db }));
router.delete('/:workoutId', (req, res) => workoutsController.deleteWorkout(req, res, { db }));

module.exports = router;
