const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    followerId: {
        type: String,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['accepted', 'pending'],
        default: 'accepted',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

followerSchema.index({ followerId: 1, userId: 1 }, { unique: true });

const Follower = mongoose.models.Follower || mongoose.model('Follower', followerSchema);
module.exports = Follower;