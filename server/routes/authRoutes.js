const express = require('express');
const router = express.Router();
const db = require('../utils/connection');
const authController = require('../controllers/authController');
const validateRegister = require('../middleware/validateRegister');
const validateLogin = require('../middleware/validateLogin');

// Route pour l'inscription
router.post('/register', validateRegister, (req, res) => authController.register(req, res, { db }));

// Route pour la connexion
router.post('/login', validateLogin, (req, res) => authController.login(req, res, { db }));
router.post('/google-login', (req, res) => authController.googleLogin(req, res, { db }));

module.exports = router;    