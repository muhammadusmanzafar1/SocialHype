const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true,
    },
    options: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        optionText: {
            type: String,
            required: true,
        },
        votes: {
            type: Number,
            default: 0
        }
    }],
    isExclusive: {
        type: Boolean,
        default: false
    },
    shareCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiryAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        },
    },
}, { timestamps: true });

const Poll = mongoose.model('Poll', userStorySchema);
module.exports = Poll;