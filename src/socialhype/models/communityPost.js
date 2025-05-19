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
    //Ref will be added later of the comment model
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    reportCount: {
        type: Number,
        default: 0,
    },
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
