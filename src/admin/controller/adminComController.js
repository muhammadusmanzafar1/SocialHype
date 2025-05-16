const CommunityService = require('../services/communityServices');

exports.getAllCommunities = async (req, res) => {
    const retval = await CommunityService.getAllCommunities(req, res);
    return retval;
}

exports.getCommunityById = async (req, res) => {
    const retval = await CommunityService.getCommunityById(req, res);
    return retval;
}

exports.createCommunity = async (req, res) => {
    const retval = await CommunityService.createCommunity(req, res);
    return retval;
}

exports.updateCommunity = async (req, res) => {
    const retval = await CommunityService.updateCommunity(req, res);
    return retval;
}

exports.updateCommunityStatus = async (req, res) => {
    const retval = await CommunityService.updateCommunityStatus(req, res);
    return retval;
}