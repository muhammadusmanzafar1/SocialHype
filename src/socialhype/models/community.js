const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['public', 'private', "paid"],
        default: 'public',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted', 'disabled'],
        default: 'active',
    },
    avatarUrl: {
        type: String,
    },
    bannerUrl: {
        type: String,
    },
    fee: {
        type: Number,
        default: 0,
    },
    totalMembers: {
        type: Number,
        default: 0,
    },
    totalPosts: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
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
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

communitySchema.statics.newEntity = async function (body, createdByAdmin) {
    const model = {
        name: body.name,
            description: body.description,
            type: body.type,
            status: body.status,
            avatarUrl: body.avatarUrl,
            bannerUrl: body.bannerUrl,
            fee: body.fee,
            totalMembers: body.totalMembers,
            totalPosts: body.totalPosts,
            totalRevenue: body.totalRevenue,
            adminId: body.adminId,
    }
    return model;
}

  const Entity = mongoose.model('Community', communitySchema);
  module.exports = Entity;