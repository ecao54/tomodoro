const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create new user
router.post('/:firebaseUID', userController.createUser);

// Get user profile
router.get('/:firebaseUID', userController.getUserProfile);

// Get user timer settings
router.get('/:firebaseUID/settings', userController.getUserSettings);

// Check if username exists
router.get('/check-username/:username', userController.checkUsername);

// Update user timer settings
router.put('/:firebaseUID/settings', userController.updateUserSettings);

// Create/Update user profile
router.post('/:firebaseUID/profile', userController.createOrUpdateProfile);

// Update existing profile
router.put('/:firebaseUID/profile', userController.updateProfile);

module.exports = router;