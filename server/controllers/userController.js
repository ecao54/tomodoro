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

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                'settings.timerValues': settings 
            },
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