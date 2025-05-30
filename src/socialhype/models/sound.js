const mongoose = require('mongoose');

const soundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    artist: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    postSoundDuration: {
        type: Number,
        required: true,
    },
    storySoundDuration: {
        type: Number,
        required: true,
    },
    isTrending: {
        type: Boolean,
        default: false,
    },
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    soundType: {
        type: String,
        enum: ['post', 'story'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Sound = mongoose.model('Sound', soundSchema);
module.exports = Sound;