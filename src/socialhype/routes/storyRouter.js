const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const upload = require('../../../middlewares/upload');

const storyController = require('../controllers/storyController');

router.post('/createStory', upload.fields([{name: 'mediaUrl', maxCount: 1}]), async (req, res) => {
    try {
        const story = await storyController.createStory(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Followers fetched successfully",
            story
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

router.get('/getStories/:userId', async (req, res) => {
    try {
        const stories = await storyController.getStories(req.params.userId);

        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Stories fetched successfully",
            stories
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

router.get('/getAllStories/:userId', async (req, res) => {
    try {
        const stories = await storyController.getAllStories(req);

        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "All stories fetched successfully",
            stories
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

router.delete('/deleteStory/:storyId', async (req, res) => {
    try {
        const deletedStory = await storyController.deleteStory(req.params.storyId);

        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Story deleted successfully",
            deletedStory
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