const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { email } = req.body;

        const user = await User.create({
            firebaseUID,
            email,
            settings: {
                timerValues: {
                    pomodoro: '25',
                    shortBreak: '5',
                    longBreak: '10'
                }
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const user = await User.findOne({ firebaseUID });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { username, firstName, lastName } = req.body;

        const user = await User.findOneAndUpdate(
            { firebaseUID },
            { username, firstName, lastName },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserSettings = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const user = await User.findOne({ firebaseUID });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ settings: user.settings });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserSettings = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { settings } = req.body;

        const user = await User.findOneAndUpdate(
            { firebaseUID },
            { 'settings.timerValues': settings.timerValues },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Username already exists' 
            });
        }
        
        res.status(200).json({ available: true });
    } catch (error) {
        console.error('Username check error:', error);
        res.status(500).json({ message: 'Error checking username' });
    }
};

exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { username, firstName, lastName } = req.body;
        
        // Check for existing username
        const existingUser = await User.findOne({ 
            username, 
            firebaseUID: { $ne: firebaseUID } 
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Username already exists' 
            });
        }

        // Continue with existing update logic
        const user = await User.findOneAndUpdate(
            { firebaseUID },
            {
                $set: {
                    username,
                    firstName,
                    lastName
                }
            },
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        res.json(user);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: error.message });
    }
};