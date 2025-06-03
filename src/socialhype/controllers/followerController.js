const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const followers = require('../models/follower');

exports.getFollowers = async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        throw new ApiError("User ID is required", httpStatus.status.BAD_REQUEST);
    }

    try {
        const followersList = await followers.find({ userId: userId }).populate('followerId', 'username profilePicture');
        
        if (!followersList || followersList.length === 0) {
            return [];
        }

        return followersList;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getFollowing = async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        throw new ApiError( "User ID is required", httpStatus.status.BAD_REQUEST);
    }

    try {
        const followingList = await followers.find({ followerId: userId }).populate('userId', 'username profilePicture');
        
        if (!followingList || followingList.length === 0) {
            return  [];
        }

        return followingList;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError( error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.followUser = async (userId, followerId) => {
    if (!userId || !followerId) {
        throw new ApiError("User ID and Follower ID are required", httpStatus.status.BAD_REQUEST);
    }

    try {
        const existingFollow = await followers.findOne({ userId, followerId });

        if (existingFollow) {
            throw new ApiError("You are already following this user", httpStatus.status.BAD_REQUEST);
        }

        const newFollow = new followers({
            userId,
            followerId,
            status: 'pending'
        });

        await newFollow.save();

        return newFollow;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.acceptFollowRequest = async (userId, followerId, status) => {
    if (!userId || !followerId) {
        throw new ApiError("User ID and Follower ID are required", httpStatus.status.BAD_REQUEST);
    }

    try {
        const followRequest = await followers.findOne({ userId, followerId });

        if (!followRequest) {
            throw new ApiError("Follow request not found", httpStatus.status.NOT_FOUND);
        }

        if (status !== 'accepted' && status !== 'rejected') {
            throw new ApiError("Invalid status. Use 'accepted' or 'rejected'", httpStatus.status.BAD_REQUEST);
        }
        if (status === 'accepted') {
            followRequest.status = 'accepted';
        } else if (status === 'rejected') {
            await followers.deleteOne({ userId, followerId });
            return { message: "Follow request rejected successfully" };
        }
        await followRequest.save();
        return followRequest;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.unfollowUser = async (userId, followerId) => {
    if (!userId || !followerId) {
        throw new ApiError("User ID and Follower ID are required", httpStatus.status.BAD_REQUEST);
    }

    try {
        const follow = await followers.findOne({ userId, followerId });

        if (!follow) {
            throw new ApiError("You are not following this user", httpStatus.status.NOT_FOUND);
        }

        const follower = await followers.deleteOne({ userId, followerId });

        return follower;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}