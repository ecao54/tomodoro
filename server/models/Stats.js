const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalStats: {
        tomatoes: {
            type: Number,
            default: 0    // Individual pomodoro periods completed
        },
        plants: {
            type: Number,
            default: 0    // Full pomodoro cycles completed
        },
        totalMinutes: {
            type: Number,
            default: 0    // Total study time accumulated
        }
    },
    sessions: [{
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['tomato', 'plant'],  // Either single pomodoro or full cycle
            required: true
        },
        duration: {
            type: Number,
            required: true  // Duration in minutes
        },
        timeOfDay: {
            type: String,
            required: true  // Time of completion for time-based analytics
        },
        settings: {
            pomodoro: {
                type: String,
                required: true
            },
            shortBreak: {
                type: String,
                required: true
            },
            longBreak: {
                type: String,
                required: true
            }
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for efficient querying
statsSchema.index({ userId: 1 });
statsSchema.index({ 'sessions.date': 1 });

module.exports = mongoose.model('Stats', statsSchema);
