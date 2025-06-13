const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
      },
    caption: {
        type: String,
    },
    mediaUrl: [{
        type: String,
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted', 'disabled'],
        default: 'active',
    },
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityReport',
        default: 0,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Entity = mongoose.model('CommunityPost', communitySchema);
module.exports = Entity;
