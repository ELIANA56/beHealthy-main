const express = require('express');
const router = express.Router();
const db = require('../utils/connection');
const authController = require('../controllers/authController');
const validateRegister = require('../middleware/validateRegister');
const validateLogin = require('../middleware/validateLogin');

// Registration route
router.post('/register', validateRegister, (req, res) => authController.register(req, res, { db }));

// Login route
router.post('/login', validateLogin, (req, res) => authController.login(req, res, { db }));
router.post('/firebase/verify', (req, res) => authController.verifyFirebaseToken(req, res, { db }));

module.exports = router;