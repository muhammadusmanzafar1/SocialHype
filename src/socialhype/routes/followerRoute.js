const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const followerController = require('../controllers/followerController');

router.get('/getFollowers/:userId', async (req, res) => {
    try {
        const followers = await followerController.getFollowers(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Followers fetched successfully",
            followers
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

router.get('/getFollowing/:userId', async (req, res) => {
    try {
        const following = await followerController.getFollowing(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Following fetched successfully",
            following
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

router.post('/followUser', async (req, res) => {
    try {
        const { userId, followerId } = req.body;

        const followResult = await followerController.followUser(userId, followerId);
        
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Follow action successful",
            followResult
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

router.patch('/acceptFollowRequest', async (req, res) => {
    try {
        const { userId, followerId } = req.body;
        const { status } = req.query;

        const acceptResult = await followerController.acceptFollowRequest(userId, followerId, status);
        
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Follow request accepted successfully",
            acceptResult
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

router.delete('/unfollowUser', async (req, res) => {
    try {
        const { userId, followerId } = req.body;

        const unfollowResult = await followerController.unfollowUser(userId, followerId);
        
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Unfollow action successful",
            unfollowResult
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
