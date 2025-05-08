const { getFollowing, getFollowers, followUser, acceptFollowRequest, unfollowUser } = require('../services/followers');

const getFollowingController = async (userId, query) => {
  return await getFollowing(userId, query);
};

const getFollowersController = async (userId, query) => {
  return await getFollowers(userId, query);
};

const followUserController = async (followerId, userId) => {
  return await followUser(followerId, userId);
};

const acceptFollowRequestController = async (userId, requesterId) => {
  return await acceptFollowRequest(userId, requesterId);
};

const unfollowUserController = async (followerId, userId) => {
  return await unfollowUser(followerId, userId);
};

module.exports = {
  getFollowing: getFollowingController,
  getFollowers: getFollowersController,
  followUser: followUserController,
  acceptFollowRequest: acceptFollowRequestController,
  unfollowUser: unfollowUserController,
};