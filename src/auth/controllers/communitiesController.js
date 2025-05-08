const { createCommunity, joinCommunity } = require('../services/communities');

const createCommunityController = async (userId, body) => {
  return await createCommunity(userId, body);
};

const joinCommunityController = async (userId, communityId) => {
  return await joinCommunity(userId, communityId);
};

module.exports = {
  createCommunity: createCommunityController,
  joinCommunity: joinCommunityController,
};