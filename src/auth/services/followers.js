const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const User = require('../models/user');
const Follower = require('../models/Follower');

const getFollowing = async (userId, { page = 1, limit = 20 }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', httpStatus.NOT_FOUND);
  }
  const skip = (page - 1) * limit;
  const following = await Follower.find({ followerId: userId, status: 'accepted' })
    .populate('userId', 'username _id')
    .skip(skip)
    .limit(limit);
  const total = await Follower.countDocuments({ followerId: userId, status: 'accepted' });
  return {
    message: 'Following list retrieved',
    data: following.map(f => f.userId),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getFollowers = async (userId, { page = 1, limit = 20 }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', httpStatus.NOT_FOUND);
  }
  const skip = (page - 1) * limit;
  const followers = await Follower.find({ userId, status: 'accepted' })
    .populate('followerId', 'username _id')
    .skip(skip)
    .limit(limit);
  const total = await Follower.countDocuments({ userId, status: 'accepted' });
  return {
    message: 'Followers list retrieved',
    data: followers.map(f => f.followerId),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const followUser = async (followerId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(followerId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }
  if (userId === followerId.toString()) {
    throw new ApiError('Cannot follow yourself', httpStatus.BAD_REQUEST);
  }
  const [user, follower, existingFollow] = await Promise.all([
    User.findById(userId),
    User.findById(followerId),
    Follower.findOne({ userId, followerId }),
  ]);
  if (!user || !follower) {
    throw new ApiError('User not found', httpStatus.NOT_FOUND);
  }
  if (existingFollow) {
    throw new ApiError('Already following this user', httpStatus.CONFLICT);
  }
  const status = user.isPrivate ? 'pending' : 'accepted';
  await Follower.create({ userId, followerId, status });
  return { message: status === 'pending' ? 'Follow request sent' : 'Successfully followed user', status };
};

const acceptFollowRequest = async (userId, requesterId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }
  const followRequest = await Follower.findOne({ userId, followerId: requesterId, status: 'pending' });
  if (!followRequest) {
    throw new ApiError('Follow request not found', httpStatus.NOT_FOUND);
  }
  followRequest.status = 'accepted';
  await followRequest.save();
  return { message: 'Follow request accepted' };
};

const unfollowUser = async (followerId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(followerId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }
  const follow = await Follower.findOneAndDelete({ userId, followerId });
  if (!follow) {
    throw new ApiError('Not following this user', httpStatus.NOT_FOUND);
  }
  return { message: 'Successfully unfollowed user' };
};

module.exports = {
  getFollowing,
  getFollowers,
  followUser,
  acceptFollowRequest,
  unfollowUser,
};