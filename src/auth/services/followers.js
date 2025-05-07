const httpStatus = require('http-status');
const Follower = require('../models/Follower');
const User = require('../models/user');
const ApiError = require('../../../utils/ApiError');

const getFollowing = async (userId, { limit = 20, page = 1 }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('User not found', httpStatus.NOT_FOUND);
    }

    const skip = (page - 1) * limit;
    const following = await Follower.find({ followerId: userId, status: 'accepted' })
        .populate('userId', 'username displayName profilePicture')
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Follower.countDocuments({ followerId: userId, status: 'accepted' });

    return {
        data: following.map(f => f.userId),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getFollowers = async (userId, { limit = 20, page = 1 }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('User not found', httpStatus.NOT_FOUND);
    }

    const skip = (page - 1) * limit;
    const followers = await Follower.find({ userId: userId, status: 'accepted' })
        .populate('followerId', 'username displayName profilePicture')
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Follower.countDocuments({ userId: userId, status: 'accepted' });

    return {
        data: followers.map(f => f.followerId),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const followUser = async (followerId, userId) => {
    if (followerId.toString() === userId.toString()) {
        throw new ApiError('Cannot follow yourself', httpStatus.BAD_REQUEST);
    }

    const followedUser = await User.findById(userId);
    if (!followedUser) {
        throw new ApiError('User not found', httpStatus.NOT_FOUND);
    }

    const existingFollow = await Follower.findOne({ followerId, userId });
    if (existingFollow) {
        throw new ApiError(
            existingFollow.status === 'accepted' ? 'Already following this user' : 'Follow request already sent',
            httpStatus.CONFLICT
        );
    }

    const status = followedUser.isPrivate ? 'pending' : 'accepted';
    const follower = new Follower({ userId, followerId, status });

    if (status === 'accepted') {
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
    }

    await follower.save();
    return {
        status,
        message: status === 'pending' ? 'Follow request sent' : 'Successfully followed user',
    };
};

const acceptFollowRequest = async (userId, requesterId) => {
    const follow = await Follower.findOne({ followerId: requesterId, userId, status: 'pending' });
    if (!follow) {
        throw new ApiError('Follow request not found', httpStatus.NOT_FOUND);
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
        throw new ApiError('Requester not found', httpStatus.NOT_FOUND);
    }

    follow.status = 'accepted';
    await User.findByIdAndUpdate(requesterId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
    await follow.save();
    return { message: 'Follow request accepted' };
};

const unfollowUser = async (followerId, userId) => {
    const follow = await Follower.findOneAndDelete({ followerId, userId, status: 'accepted' });
    if (!follow) {
        throw new ApiError('Not following this user', httpStatus.NOT_FOUND);
    }
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });
    return { message: 'Successfully unfollowed user' };
};

module.exports = {
    getFollowing,
    getFollowers,
    followUser,
    acceptFollowRequest,
    unfollowUser,
};