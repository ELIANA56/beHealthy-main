const express = require('express');
const db = require('../utils/connection'); // Votre connexion DB
const router = express.Router();
const articlesController = require('../controllers/articlesController');

// Route to fetch articles
router.get('/articles', (req, res) => articlesController.listArticles(req, res, { db }));

module.exports = router;  