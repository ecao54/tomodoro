const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUID: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    settings: {
        timerValues: {
            pomodoro: { type: String, default: '25' },
            shortBreak: { type: String, default: '5' },
            longBreak: { type: String, default: '15' }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);