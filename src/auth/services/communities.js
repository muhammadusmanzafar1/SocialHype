const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const User = require('../models/user');
const Community = require('../models/Community');

const createCommunity = async (userId, { name, description }) => {
  const community = new Community({
    name,
    description,
    creatorId: userId,
    members: [userId],
  });
  await community.save();

  await User.findByIdAndUpdate(userId, { $push: { joinedCommunity: community._id } });
  return community;
};

const joinCommunity = async (userId, communityId) => {
  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    throw new ApiError('Invalid community ID', httpStatus.BAD_REQUEST);
  }
  const community = await Community.findById(communityId);
  if (!community) {
    throw new ApiError('Community not found', httpStatus.NOT_FOUND);
  }
  if (community.members.includes(userId)) {
    throw new ApiError('Already a member', httpStatus.CONFLICT);
  }
  await Community.findByIdAndUpdate(communityId, { $push: { members: userId } });
  await User.findByIdAndUpdate(userId, { $push: { joinedCommunity: communityId } });
};

module.exports = { createCommunity, joinCommunity };