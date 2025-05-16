const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    lastActiveAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ['admin', 'member', 'moderator'],
    },

})

const Entity = mongoose.model('CommunityMember', communitySchema);
module.exports = Entity;