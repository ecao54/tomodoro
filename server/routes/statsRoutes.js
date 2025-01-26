const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Stats = require('../models/Stats');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Helper function to get time ranges
const getTimeRanges = (period, offset = 0) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const offsetDate = new Date(today);
    
    switch(period) {
        case 'today':
            offsetDate.setDate(today.getDate() + parseInt(offset));
            return {
                start: new Date(offsetDate.setHours(0, 0, 0, 0)),
                end: new Date(offsetDate.setHours(23, 59, 59, 999))
            };
            
        case 'week':
            offsetDate.setDate(today.getDate() + (parseInt(offset) * 7));
            const weekStart = new Date(offsetDate);
            weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            return { start: weekStart, end: weekEnd };
            
        case 'month':
            offsetDate.setMonth(today.getMonth() + parseInt(offset));
            return {
                start: new Date(offsetDate.getFullYear(), offsetDate.getMonth(), 1, 0, 0, 0, 0),
                end: new Date(offsetDate.getFullYear(), offsetDate.getMonth() + 1, 0, 23, 59, 59, 999)
            };
            
        case 'year':
            offsetDate.setFullYear(today.getFullYear() + parseInt(offset));
            return {
                start: new Date(offsetDate.getFullYear(), 0, 1, 0, 0, 0, 0),
                end: new Date(offsetDate.getFullYear(), 11, 31, 23, 59, 59, 999)
            };
            
        default:
            return {
                start: new Date(today.getFullYear() - 4, 0, 1, 0, 0, 0, 0),
                end: now
            };
    }
};

const calculateStreaks = (sessions) => {
    if (!sessions.length) return { currentStreak: 0, longestStreak: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's a session today
    const hasSessionToday = sessions.some(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= today;
    });
    
    if (!hasSessionToday) return { currentStreak: 0, longestStreak: 0 };
    
    let currentStreak = 1;
    let longestStreak = 1;
    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
        const hasSession = sessions.some(session => {
            const sessionDate = new Date(session.timestamp);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === checkDate.getTime();
        });
        
        if (!hasSession) break;
        
        currentStreak++;
        longestStreak = Math.max(currentStreak, longestStreak);
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { currentStreak, longestStreak };
};

// Get stats for a period
router.get('/period', async (req, res, next) => {
    try {
        const { userId, period, offset } = req.query;
        const stats = await Stats.findOne({ userId });
        
        if (!stats) {
            return res.json({
                tomatoes: 0,
                plants: 0,
                totalMinutes: 0,
                streak: 0,
                currentStreak: 0,
                sessions: []
            });
        }

        const timeRange = getTimeRanges(period, parseInt(offset) || 0);
        const filteredSessions = stats.sessions.filter(session => {
            const sessionDate = new Date(session.timestamp);
            return sessionDate >= timeRange.start && sessionDate <= timeRange.end;
        });

        // Calculate both streaks
        const { currentStreak, longestStreak } = calculateStreaks(stats.sessions);
        
        // Update longest streak if current is longer
        if (currentStreak > stats.streak) {
            stats.streak = currentStreak;
            await stats.save();
        }

        res.json({
            ...stats.toObject(),
            sessions: filteredSessions,
            tomatoes: filteredSessions.filter(s => s.type === 'tomato').length,
            plants: filteredSessions.filter(s => s.type === 'plant').length,
            totalMinutes: filteredSessions.reduce((sum, s) => sum + s.duration, 0),
            currentStreak,
            streak: Math.max(currentStreak, stats.streak)
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});

// Update stats endpoint
router.post('/update', async (req, res, next) => {
    try {
        const { userId, sessionType, duration } = req.body;
        console.log('Updating stats:', { userId, sessionType, duration });

        if (req.user.uid !== userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const currentDate = new Date();
        
        const updateData = {
            $inc: {
                totalMinutes: duration
            },
            $set: {
                lastStudyDate: currentDate
            },
            $push: {
                sessions: {
                    timestamp: currentDate,
                    duration: duration,
                    type: sessionType
                }
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
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                updateData.$inc.streak = 1;
            } else if (diffDays > 1) {
                updateData.$set.streak = 1;
            }
        }

        const stats = await Stats.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        console.log('Updated stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Update stats error:', error);
        next(error);
    }
});

// Reset stats endpoint
router.post('/reset', async (req, res, next) => {
    try {
        const { userId } = req.body;

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
                    lastStudyDate: new Date(),
                    sessions: []
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
