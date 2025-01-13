const Stats = require('../models/Stats');

// Helper function to get time ranges
const getTimeRanges = (currentDate = new Date()) => {
    const today = new Date(currentDate);
    
    return {
        today: {
            start: new Date(today.setHours(0, 0, 0, 0)),
            end: new Date(today.setHours(23, 59, 59, 999))
        },
        past_week: {
            start: new Date(today.setDate(today.getDate() - 7)),
            end: currentDate
        },
        past_month: {
            start: new Date(today.setDate(today.getDate() - 30)),
            end: currentDate
        },
        past_six_months: {
            start: new Date(today.setMonth(today.getMonth() - 6)),
            end: currentDate
        },
        past_year: {
            start: new Date(today.setFullYear(today.getFullYear() - 1)),
            end: currentDate
        },
        all_time: {
            start: null,
            end: currentDate
        }
    };
};

// Update stats after completing a session
exports.updateStats = async (req, res) => {
    try {
        const { 
            userId, 
            sessionType,    // 'tomato' or 'plant'
            duration 
        } = req.body;

        const currentDate = new Date();
        const timeOfDay = currentDate.toLocaleTimeString();

        // Update total stats and add new session
        const stats = await Stats.findOneAndUpdate(
            { userId },
            {
                $inc: {
                    'totalStats.tomatoes': sessionType === 'tomato' ? 1 : 0,
                    'totalStats.plants': sessionType === 'plant' ? 1 : 0,
                    'totalStats.totalMinutes': duration
                },
                $push: {
                    sessions: {
                        date: currentDate,
                        type: sessionType,
                        duration: duration,
                        timeOfDay: timeOfDay
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get stats for specific time period
exports.getStats = async (req, res) => {
    try {
        const { userId, period } = req.query;
        const timeRanges = getTimeRanges();
        const timeRange = timeRanges[period];

        const query = {
            userId,
            ...(timeRange.start && {
                'sessions.date': {
                    $gte: timeRange.start,
                    $lte: timeRange.end
                }
            })
        };

        const stats = await Stats.findOne(query);
        
        if (!stats) {
            return res.json({
                tomatoes: 0,
                plants: 0,
                totalMinutes: 0,
                sessions: []
            });
        }

        // Calculate period-specific stats
        const filteredSessions = stats.sessions.filter(session => 
            !timeRange.start || (
                session.date >= timeRange.start && 
                session.date <= timeRange.end
            )
        );

        const periodStats = {
            tomatoes: filteredSessions.filter(s => s.type === 'tomato').length,
            plants: filteredSessions.filter(s => s.type === 'plant').length,
            totalMinutes: filteredSessions.reduce((acc, s) => acc + s.duration, 0),
            sessions: filteredSessions
        };

        res.json(periodStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get daily breakdown for graphs
exports.getDailyStats = async (req, res) => {
    try {
        const { userId, period } = req.query;
        const timeRanges = getTimeRanges();
        const timeRange = timeRanges[period];

        const stats = await Stats.aggregate([
            {
                $match: {
                    userId,
                    ...(timeRange.start && {
                        'sessions.date': {
                            $gte: timeRange.start,
                            $lte: timeRange.end
                        }
                    })
                }
            },
            {
                $unwind: '$sessions'
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$sessions.date' }
                    },
                    totalMinutes: { $sum: '$sessions.duration' },
                    tomatoes: {
                        $sum: { $cond: [{ $eq: ['$sessions.type', 'tomato'] }, 1, 0] }
                    },
                    plants: {
                        $sum: { $cond: [{ $eq: ['$sessions.type', 'plant'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;
