const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const CommunityPost = require('../controller/adminComPost');

router.get('/getCommunityPosts/:communityId', async (req, res) => {
    try {
        const posts = await CommunityPost.getCommunityPosts(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community posts fetched successfully", posts });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.patch('/disableCommunityPost', async (req, res) => {
    try {
        const post = await CommunityPost.disableCommunityPost(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community post disabled successfully", post });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete('/deleteCommunityPost/:postId', async (req, res) => {
    try {
        const post = await CommunityPost.deleteCommunityPost(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community post deleted successfully", post });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;