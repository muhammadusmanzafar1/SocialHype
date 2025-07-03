const mongoose = require('mongoose');

const spotifyAccessTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    expiresIn: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

const SpotifyAccessToken = mongoose.model('SpotifyAccessToken', spotifyAccessTokenSchema);
module.exports = SpotifyAccessToken;