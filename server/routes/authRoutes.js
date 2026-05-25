const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRegister = require('../middleware/validateRegister');
const validateLogin = require('../middleware/validateLogin');

module.exports = (db, ai) => {
  router.post('/register', (req, res, next) => validateRegister(req, res, next, db), (req, res) => authController.register(req, res, { db, ai }));
  router.post('/login', validateLogin, (req, res) => authController.login(req, res, { db, ai }));
    
    return router;
};