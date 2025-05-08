const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const User = require('../models/user');
const Follower = require('../models/Follower');
const Community = require('../models/Community');

const getProfileSummary = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError('Invalid user ID', httpStatus.BAD_REQUEST);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', httpStatus.NOT_FOUND);
  }

  const [followersCount, followingCount, createdCommunitiesCount] = await Promise.all([
    Follower.countDocuments({ userId, status: 'accepted' }),
    Follower.countDocuments({ followerId: userId, status: 'accepted' }),
    Community.countDocuments({ creatorId: userId }),
  ]);

  return {
    totalPosts: user.postsCount || 0,
    followersCount,
    followingCount,
    joinedCommunitiesCount: user.joinedCommunity?.length || 0,
    createdCommunitiesCount,
  };
};

module.exports = { getProfileSummary };