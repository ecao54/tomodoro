const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUID: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    settings: {
        timerValues: {
            pomodoro: { type: String, default: '25' },
            shortBreak: { type: String, default: '5' },
            longBreak: { type: String, default: '10' }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);