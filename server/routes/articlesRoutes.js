const express = require('express');
const db = require('../utils/connection');
const router = express.Router();
const articlesController = require('../controllers/articlesController');

router.get('/', (req, res) => articlesController.listWeeklyArticles(req, res, { db }));
router.get('/weekly', (req, res) => articlesController.listWeeklyArticles(req, res, { db }));
router.get('/articles', (req, res) => articlesController.listWeeklyArticles(req, res, { db }));

module.exports = router;
