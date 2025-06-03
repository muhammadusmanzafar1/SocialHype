const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const liveController = require('../controllers/liveController');

// Route to start a live session
router.post('/start', async (req, res) => {
    try {
        const LiveSession = await liveController.startLiveSession(req);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Live session started successfully",
            LiveSession
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

// Route to end a live session
router.post('/end', async (req, res) => {
    try {
        const LiveSession = await liveController.endLiveSession(req);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Live session ended successfully",
            LiveSession
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

// Route to get live sessions
router.get('/getLiveSessions/:sessionId', async (req, res) => {
    try {
        const liveSessions = await liveController.getLiveSessions(req);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Live sessions fetched successfully",
            liveSessions
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