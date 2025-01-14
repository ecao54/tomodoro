const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Stats = require('../models/Stats');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get stats for a period
router.get('/period', async (req, res, next) => {
    try {
        const { userId, period } = req.query;
        console.log('Fetching stats for:', { userId, period });

        // Get stats from MongoDB
        const stats = await Stats.findOne({ userId });
        console.log('Found stats:', stats);

        // If no stats found, return default values
        if (!stats) {
            return res.json({
                tomatoes: 0,
                plants: 0,
                totalMinutes: 0,
                streak: 0
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('Stats route error:', {
            message: error.message,
            stack: error.stack
        });
        next(error);
    }
});

// Update stats endpoint
router.post('/update', async (req, res, next) => {
    try {
        const { userId, sessionType, duration } = req.body;
        console.log('Updating stats:', { userId, sessionType, duration });

        // Verify user from token matches request
        if (req.user.uid !== userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const updateData = {
            $inc: {
                totalMinutes: duration
            },
            $set: {
                lastStudyDate: new Date()
            }
        };

        // Update specific counters based on session type
        if (sessionType === 'tomato') {
            updateData.$inc.tomatoes = 1;
        } else if (sessionType === 'plant') {
            updateData.$inc.plants = 1;
        }

        // Update streak logic
        const currentUser = await Stats.findOne({ userId });
        if (currentUser) {
            const lastDate = currentUser.lastStudyDate;
            const today = new Date();
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Continue streak
                updateData.$inc.streak = 1;
            } else if (diffDays > 1) {
                // Reset streak
                updateData.$set.streak = 1;
            }
            // If diffDays === 0, same day, don't update streak
        }

        const stats = await Stats.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        console.log('Updated stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Update stats error:', {
            message: error.message,
            stack: error.stack,
            userId: req.body.userId
        });
        next(error);
    }
});

// Reset stats endpoint
router.post('/reset', async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Verify user from token matches request
        if (req.user.uid !== userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const stats = await Stats.findOneAndUpdate(
            { userId },
            {
                $set: {
                    tomatoes: 0,
                    plants: 0,
                    totalMinutes: 0,
                    streak: 0,
                    lastStudyDate: new Date()
                }
            },
            { new: true, upsert: true }
        );

        res.json(stats);
    } catch (error) {
        console.error('Reset stats error:', error);
        next(error);
    }
});

module.exports = router;
