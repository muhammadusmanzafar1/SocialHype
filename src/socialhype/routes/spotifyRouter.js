const express = require('express');
const router = express.Router();
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const spotifyController = require('../controllers/spotifyController');
const spotifyService = require('../services/spotifyService');

router.get('/login', async (req, res) => {
    try {
        const url = await spotifyController.login(req, res);
        res.status(200).json({
            isSuccess: true,
            message: "Redirecting to Spotify login",
            url
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ message: "Missing code" });
    }

    try {
        const tokenData = await spotifyController.getTokenFromCode(req);
        res.status(200).json({
            isSuccess: true,
            message: "Successfully retrieved access token",
            tokenData
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/refresh', async (req, res) => {
    const refreshToken = req.query.refresh_token;

    if (!refreshToken) {
        return res.status(400).json({ message: "Missing refresh token" });
    }
    try {
        const tokenData = await spotifyService.refreshAccessToken(refreshToken);
        res.status(200).json({
            isSuccess: true,
            message: "Successfully refreshed access token",
            tokenData
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/get-track', async (req, res) => {
    try {
        const sounds = await spotifyController.getSounds(req, res);
        res.status(200).json({
            isSuccess: true,
            message: "Successfully retrieved sounds",
            sounds
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;