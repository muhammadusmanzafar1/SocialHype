const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const querystring = require('querystring');
const axios = require('axios');
const spotifyModel = require('../models/spotifyAccessToken');
const string = require('../../../helper/string')
const spotifyService = require('../services/spotifyService');

exports.login = async (req, res) => {
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
    const randomString = string.generateRandomString(16);

    let state = randomString;

    const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: process.env.SPOTIFY_SCOPES,
            redirect_uri: redirect_uri,
            state: state
        });

    return url;
}

exports.getTokenFromCode = async (req) => {
    const code = req.query.code || null;
    const userId = req.user._id;
    const response = await spotifyService.getSpotifyAuthUrl(code);
    if (!response || !response.access_token) {
        throw new ApiError("Failed to retrieve access token from Spotify", httpStatus.status.BAD_REQUEST);
    }

    const data = new spotifyModel({
        userId: userId,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: new Date(Date.now() + response.expires_in * 1000)
    });
    
    await data.save();

    return response;
}

exports.getSounds = async (req, res) => {
    const { countryCode, limit } = req.query;
    const userId = req.user._id;
    const accessTokenData = await spotifyService.getValidAccessToken(userId);
    
    if (!accessTokenData) {
        throw new ApiError("Access token is required", httpStatus.status.BAD_REQUEST);
    }
    const data = await spotifyService.getNewReleasesForCountry(accessTokenData, countryCode, limit);
    if (!data) {
        throw new ApiError("Failed to retrieve sounds from Spotify", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}
