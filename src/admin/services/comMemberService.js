const CommunityMember = require('../../socialhype/models/communityMembers');
const Community = require('../../socialhype/models/community');
const CommunityPost = require('../../socialhype/models/communityPost');
const ApiError = require('../../../utils/ApiError');
const User = require('../../auth/models/user');
const httpStatus = require('http-status');

exports.getCommunityMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const members = await CommunityMember.find({ communityId: id })
            .populate('userId')
            .populate('communityId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (!members || members.length === 0) {
            throw new ApiError('No members found for this community', httpStatus.status.NOT_FOUND);
        }

        const totalMembers = await CommunityMember.countDocuments({ communityId: id });
        const totalPages = Math.ceil(totalMembers / limit);

        return {
            members,
            totalPages,
            currentPage: parseInt(page),
            totalMembers,
        }
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.addCommunityMember = async (req, res) => {
    try {
        const { userId, communityId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
        }
        const community = await Community.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }
        const communityMember = new CommunityMember({ userId, communityId });
        await communityMember.save();
        return communityMember;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.disableCommunityMember = async (req, res) => {
    try {
        const { userId, communityId } = req.body;
        const communityMember = await CommunityMember.findOne({ userId, communityId });
        if (!communityMember) {
            throw new ApiError('Community member not found', httpStatus.status.NOT_FOUND);
        }
        communityMember.isDisabled = true;
        await communityMember.save();
        return communityMember;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deleteCommunityMember = async (req, res) => {
    try {
        const { userId, communityId } = req.body;
        const communityMember = await CommunityMember.findOneAndDelete({ userId, communityId });
        if (!communityMember) {
            throw new ApiError('Community member not found', httpStatus.status.NOT_FOUND);
        }

        await CommunityPost.deleteMany({ postedBy: userId, communityId });

        return communityMember;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getCommunityModerators = async (req, res) => {
    try {
        const { communityId } = req.params;
        const members = await CommunityMember.find({ communityId, role: 'moderator' })
        .populate('userId')
        .populate('communityId');
        if (!members || members.length === 0) {
            throw new ApiError('No moderators found for this community', httpStatus.status.NOT_FOUND);
        }
        
        return members;
    }
    catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.addCommunityModerator = async (req, res) => {
    try {
        const { userId, communityId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
        }
        const community = await Community.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }
        const communityMember = new CommunityMember({ userId, communityId, role: 'moderator' });
        await communityMember.save();
        return communityMember;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.changeCommunityModeratorStatus = async (req, res) => {
    try {
        const { userId, communityId } = req.body;
        const communityMember = await CommunityMember.findOne({ userId, communityId, role: 'moderator' });
        if (!communityMember) {
            throw new ApiError('Community member not found', httpStatus.status.NOT_FOUND);
        }
        communityMember.role = communityMember.role === 'moderator' ? 'member' : 'moderator';
        await communityMember.save();
        return communityMember;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}
