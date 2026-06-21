/**
 * AUTH ROUTES — URL paths for sign-up and sign-in.
 *
 * POST /api/auth/register — create account with email
 * POST /api/auth/login    — email + password
 * POST /api/auth/google   — Google OAuth credential
 */
const express = require('express');
const router = express.Router();
const db = require('../utils/connection');
const authController = require('../controllers/authController');
const validateRegister = require('../middleware/validateRegister');
const validateLogin = require('../middleware/validateLogin');

router.post('/register', validateRegister, (req, res) => authController.register(req, res, { db }));
router.post('/login', validateLogin, (req, res) => authController.login(req, res, { db }));
router.post('/google', (req, res) => authController.googleAuth(req, res, { db }));

module.exports = router;