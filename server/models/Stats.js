const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    duration: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['tomato', 'plant'],
        required: true
    }
});

const statsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    tomatoes: {
        type: Number,
        default: 0
    },
    plants: {
        type: Number,
        default: 0
    },
    totalMinutes: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    currentStreak: { 
        type: Number, 
        default: 0 
    },
    lastStudyDate: {
        type: Date,
        default: Date.now
    },
    sessions: [studySessionSchema]
});

module.exports = mongoose.model('Stats', statsSchema);
