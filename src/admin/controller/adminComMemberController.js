const CommunityMember = require('../services/comMemberService');

exports.getCommunityMember = async (req, res) => {
    const retVal = await CommunityMember.getCommunityMemberById(req, res);
    return retVal;
}

exports.addCommunityMember = async (req, res) => {
    const retVal = await CommunityMember.addCommunityMember(req, res);
    return retVal;
}

exports.disableCommunityMember = async (req, res) => {
    const retVal = await CommunityMember.disableCommunityMember(req, res);
    return retVal;
}

exports.deleteCommunityMember = async (req, res) => {
    const retVal = await CommunityMember.deleteCommunityMember(req, res);
    return retVal;
}

exports.getCommunityModerators = async (req, res) => {
    const retVal = await CommunityMember.getCommunityModerators(req, res);
    return retVal;
}

exports.addCommunityModerator = async (req, res) => {
    const retVal = await CommunityMember.addCommunityModerator(req, res);
    return retVal;
}

exports.changeCommunityModeratorStatus = async (req, res) => {
    const retVal = await CommunityMember.changeCommunityModeratorStatus(req, res);
    return retVal;
}