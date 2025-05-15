const mongoose = require('mongoose');

const adRevenueSchema = new mongoose.Schema({
    advertiserName: {
        type: String,
        required: true,
    },
    campaignName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    impressions: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
});

const Entity = mongoose.model('AdRevenue', adRevenueSchema);
module.exports = Entity;