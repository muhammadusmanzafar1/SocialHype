const asyncHandler = require('express-async-handler');
const followersService = require('../services/followers');
const httpStatus = require('http-status');

const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit, page } = req.query;
    const result = await followersService.getFollowing(userId, { limit: parseInt(limit), page: parseInt(page) });
    res.status(httpStatus.OK).json({ message: 'Following list retrieved', ...result });
});

const getFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit, page } = req.query;
    const result = await followersService.getFollowers(userId, { limit: parseInt(limit), page: parseInt(page) });
    res.status(httpStatus.OK).json({ message: 'Followers list retrieved', ...result });
});

const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const followerId = req.user._id;
    const result = await followersService.followUser(followerId, userId);
    res.status(httpStatus.OK).json(result);
});

const acceptFollowRequest = asyncHandler(async (req, res) => {
    const { requesterId } = req.body;
    const userId = req.user._id;
    const result = await followersService.acceptFollowRequest(userId, requesterId);
    res.status(httpStatus.OK).json(result);
});

const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const followerId = req.user._id;
    const result = await followersService.unfollowUser(followerId, userId);
    res.status(httpStatus.OK).json(result);
});

module.exports = {
    getFollowing,
    getFollowers,
    followUser,
    acceptFollowRequest,
    unfollowUser,
};