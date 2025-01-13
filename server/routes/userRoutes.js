const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user profile
router.get('/:userId', userController.getUserProfile);

// Update user timer settings
router.put('/:userId/settings', userController.updateUserSettings);

// Update user profile
router.put('/:userId/profile', userController.updateProfile);

module.exports = router;
