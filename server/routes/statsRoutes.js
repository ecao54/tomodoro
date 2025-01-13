const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Update stats after completing a session
router.post('/update', statsController.updateStats);

// Get stats for specific time period
router.get('/period', statsController.getStats);

// Get daily breakdown for graphs
router.get('/daily', statsController.getDailyStats);

// Get stats by user ID
router.get('/user/:userId', statsController.getStats);

// Optional: Get specific period stats by user ID
router.get('/user/:userId/period/:period', statsController.getStats);

// Optional: Get daily stats by user ID
router.get('/user/:userId/daily', statsController.getDailyStats);

module.exports = router;
