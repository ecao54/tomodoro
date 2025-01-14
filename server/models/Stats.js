const mongoose = require('mongoose');

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
    lastStudyDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stats', statsSchema);
