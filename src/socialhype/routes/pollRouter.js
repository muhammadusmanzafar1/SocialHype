const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const pollController = require('../controllers/pollController');

router.post('/createPoll', async (req, res) => {
    try {
        const poll = await pollController.createPoll(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Poll created successfully",
            poll
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

router.get('/getPolls', async (req, res) => {
    try {
        const polls = await pollController.getPolls(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Polls fetched successfully",
            polls
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

router.put('/votePoll', async (req, res) => {
    try {
        const updatedPoll = await pollController.votePoll(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Vote recorded successfully",
            updatedPoll
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

router.delete('/deletePoll/:pollId', async (req, res) => {
    try {
        const deletedPoll = await pollController.deletePoll(req);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Poll deleted successfully",
            deletedPoll
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