const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validateUpdateProfile = require('../middleware/validateUpdateProfile');

router.get('/:userId', userController.getUserProfile);
router.put('/:userId', validateUpdateProfile, userController.updateUserProfile);
router.delete('/:userId', userController.deleteUserAccount);

module.exports = router;
