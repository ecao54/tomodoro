const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { settings } = req.body;

        const user = await User.findOneAndUpdate(
            { firebaseUID: userId },
            { 
                'settings.timerValues': settings.timerValues 
            },
            { new: true, upsert: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.log('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Getting settings for user:', userId);

        const user = await User.findOne({ firebaseUID: userId });
        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log actual values from DB
        console.log('DB timer values:', user.settings?.timerValues);

        res.json({
            settings: user.settings || {
                timerValues: {
                    pomodoro: '25',
                    shortBreak: '5',
                    longBreak: '15'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};