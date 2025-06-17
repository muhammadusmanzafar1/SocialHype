const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const UserCommunity = require('../models/community');
const CommunityMember = require('../models/communityMembers');


exports.getCommunityMembers = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const members = await CommunityMember.find({ communityId, status: 'active' })
            .populate('userId', 'username fullName profilePicture')
            .select('userId role isDisabled joinedAt lastActiveAt status')
            .skip(skip)
            .limit(parseInt(limit));

        const totalMembers = await CommunityMember.countDocuments({ communityId, status: 'active' });

        if (!members || members.length === 0) {
            throw new ApiError('No members found in this community', httpStatus.status.NOT_FOUND);
        }

        const formattedMembers = members
            .filter(member => member.userId !== null)
            .map(member => ({
                userDetail: {
                    userId: member.userId._id,
                    fullName: member.userId.fullName || '',
                    username: member.userId.username || '',
                    profilePicture: member.userId.profilePicture || ''
                },
                role: member.role,
                status: member.status || '',
                isDisabled: member.isDisabled,
                joinedAt: member.joinedAt,
                lastActiveAt: member.lastActiveAt
            }));

        return {
            members: formattedMembers,
            totalMembers,
            totalPages: Math.ceil(totalMembers / limit),
            currentPage: parseInt(page)
        };
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while fetching community members ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getCommunityModerators = async (req, res) => {
    try {
        const { communityId } = req.params;
        const moderators = await CommunityMember.find({ communityId, role: 'moderator', status: 'active' })
            .populate('userId', 'username fullName profilePicture')
            .select('userId role isDisabled joinedAt lastActiveAt status');
        if (!moderators || moderators.length === 0) {
            throw new ApiError('No moderators found in this community', httpStatus.status.NOT_FOUND);
        }
        const mod = moderators
            .filter(mod => mod.userId !== null)
            .map(mod => ({
                userDetail: {
                    userId: mod.userId._id,
                    fullName: mod.userId.fullName || '',
                    username: mod.userId.username || '',
                    profilePicture: mod.userId.profilePicture || ''
                },
                role: mod.role,
                isDisabled: mod.isDisabled,
                joinedAt: mod.joinedAt,
                lastActiveAt: mod.lastActiveAt
            }));

        return mod;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while fetching community moderators ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.addModerator = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userIds = [] } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError('User ID is required to add a moderator', httpStatus.status.BAD_REQUEST);
        }

        const existingModerators = await CommunityMember.find({
            communityId,
            userId: { $in: userIds },
            role: 'moderator',
            status: 'active'
        });

        if (existingModerators.length > 0) {
            const existingUserIds = existingModerators.map(mod => mod.userId.toString());
            throw new ApiError(`Users with IDs ${existingUserIds.join(', ')} are already moderators of this community`, httpStatus.status.BAD_REQUEST);
        }

        const newModerators = userIds.map(userId => ({
            communityId,
            userId,
            role: 'moderator',
            status: 'active',
        }));

        const savedModerators = await CommunityMember.insertMany(newModerators);

        if (!savedModerators || savedModerators.length === 0) {
            throw new ApiError('Failed to add moderators', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return savedModerators;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while adding a moderator ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getCommunityRequests = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const pendingRequests = await CommunityMember.find({ communityId, role: "member", status: "pending" })
            .populate('userId', 'fullName username profilePicture status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await CommunityMember.countDocuments({ communityId, role: "member", status: "pending" });

        return {
            requests: pendingRequests,
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page)
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while fetching community requests ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.acceptCommunityRequest = async (req, res) => {
    try {
        const { communityId, userId } = req.params;

        const request = await CommunityMember.findOne({ communityId, userId, role: "member", status: "pending" });
        if (!request) {
            throw new ApiError('Request not found or already processed', httpStatus.status.NOT_FOUND);
        }
        request.status = "active";
        request.lastActiveAt = new Date();
        const updatedRequest = await request.save();
        if (!updatedRequest) {
            throw new ApiError('Failed to accept community request', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return updatedRequest;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while accepting community request ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.rejectCommunityRequest = async (req, res) => {
    try {
        const { communityId, userId } = req.params;

        const request = await CommunityMember.findOneAndDelete({ communityId, userId, role: "member", status: "pending" });
        if (!request) {
            throw new ApiError('Request not found or already processed', httpStatus.status.NOT_FOUND);
        }

        return { message: 'Community request rejected successfully', userId, communityId };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while rejecting community request ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.changeCommunityAdmin = async (req, res) => {
    try {
        const { communityId, userId } = req.params;

        const community = await UserCommunity.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }

        const currentAdmin = await CommunityMember.findOne({
            communityId,
            userId: community.adminId,
            role: 'admin'
        });

        if (!currentAdmin) {
            throw new ApiError('Current admin record not found', httpStatus.status.NOT_FOUND);
        }

        currentAdmin.role = 'moderator';
        await currentAdmin.save();

        let newAdminMember = await CommunityMember.findOne({ communityId, userId });

            newAdminMember.role = 'admin';
            newAdminMember.status = 'active';
            await newAdminMember.save();
        
        community.adminId = userId;
        await community.save();

        return newAdminMember;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while rejecting community request ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}