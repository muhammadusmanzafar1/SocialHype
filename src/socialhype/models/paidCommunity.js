const mongoose = require('mongoose');

const { Schema } = mongoose;

const PaidCommunitySchema = new Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'community' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    amount: { type: Number, required: true },
    platformShare: { type: Number, required: true, },
    ownerShare: { type: Number, required: true, },
    timestamp: { type: Date, default: Date.now }
});

const Entity = mongoose.model('PaidCommunity', PaidCommunitySchema);
module.exports = Entity;