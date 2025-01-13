const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Add index for better query performance
    },
    authorName: {
        type: String,
        required: true
    },
    studySession: {
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
        },
        duration: {
            type: Number,
            required: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    },
    content: {
        photo: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: true,
            trim: true  // Remove whitespace
        },
        location: {
            type: String,
            required: true,
            trim: true
        }
    },
    social: {
        likes: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            likedAt: { 
                type: Date, 
                default: Date.now 
            }
        }],
        comments: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            userName: String,
            text: {
                type: String,
                trim: true
            },
            createdAt: { 
                type: Date, 
                default: Date.now 
            }
        }]
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true  // Add index for sorting
    }
});

// Add compound index for efficient queries
postSchema.index({ author: 1, createdAt: -1 });

// Add virtual for likes count
postSchema.virtual('likesCount').get(function() {
    return this.social.likes.length;
});

// Add virtual for comments count
postSchema.virtual('commentsCount').get(function() {
    return this.social.comments.length;
});

// Ensure virtuals are included when converting document to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
