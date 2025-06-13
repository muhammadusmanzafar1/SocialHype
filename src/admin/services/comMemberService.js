const CommunityMember = require('../../socialhype/models/communityMembers');
const Community = require('../../socialhype/models/community');
const CommunityPost = require('../../socialhype/models/communityPost');
const ApiError = require('../../../utils/ApiError');
const User = require('../../auth/models/user');
const httpStatus = require('http-status');
const { log } = require('winston');
const CommunityReport = require('../../socialhype/models/communityReport');

exports.getCommunityMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, } = req.query;

        const members = await CommunityMember.find({ communityId: id })
            .populate('userId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (!members || members.length === 0) {
            throw new ApiError('No members found for this community', httpStatus.status.NOT_FOUND);
        }

        const totalMembers = await CommunityMember.countDocuments({ communityId: id });
        const totalPages = Math.ceil(totalMembers / limit);

        return {
            users: members.map(member => ({
                _id: member._id,
                userId: member.userId?._id || null,
                username: member.userId?.username || null,
                fullName: member.userId?.fullName || null,
                email: member.userId?.email || null,
                profilePicture: member.userId?.profilePicture || null,
                gender: member.userId?.gender || null,
                status: member.userId?.status || null,
                createdOn: member.userId?.createdAt || null,
                lastActive: member.lastActiveAt || "N/A",
                totalPosts: member.userId?.postsCount || 0,
                accountStatus: member.isDisabled ? "Disabled" : "Enabled",
                userType: member.userId?.userType || null,
            })),
            totalMembers,
            totalPages,
            currentPage: parseInt(page),
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

// exports.addCommunityMember = async (req, res) => {
//     try {
//         const { userId, communityId } = req.body;
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
//         }
//         const community = await Community.findById(communityId);
//         if (!community) {
//             throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
//         }
//         const communityMember = new CommunityMember({ userId, communityId });
//         await communityMember.save();
//         return communityMember;
//     } catch (error) {
//         if (error instanceof ApiError) {
//             return error;
//         }
//         throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
//     }
// }

exports.disableCommunityMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const communityMember = await CommunityMember.findById(memberId);
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

exports.deleteCommunityMembers = async (req) => {
    try {
        const { communityId } = req.params;
        const { userIds = [] } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError("No userIds provided", httpStatus.status.BAD_REQUEST);
        }

        const members = await CommunityMember.find({ userId: { $in: userIds }, communityId });

        if (members.length === 0) {
            throw new ApiError("No matching community members found", httpStatus.status.NOT_FOUND);
        }

        for (const member of members) {
            const communityData = await Community.findById(member.communityId);
            if (communityData?.adminId?.toString() === member.userId.toString()) {
                throw new ApiError(
                    `Cannot delete user ${member.userId}: user is admin of community ${communityData.name}`,
                    httpStatus.status.FORBIDDEN
                );
            }
        }

        const deletionTasks = [];
        const postCleanupTasks = [];

        for (const member of members) {
            const userId = member.userId;
            const communityId = member.communityId;

            deletionTasks.push(CommunityMember.deleteOne({ _id: member._id }));

            const posts = await CommunityPost.find({ postedBy: userId, communityId });
            const postIds = posts.map(post => post._id);

            postCleanupTasks.push(
                CommunityPost.deleteMany({ postedBy: userId, communityId }),
                CommunityReport.deleteMany({ postId: { $in: postIds } })
            );
        }

        await Promise.all([...deletionTasks, ...postCleanupTasks]);

        return members;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deleteCommunityMember = async (req) => {
    try {
        const { memberId } = req.params;
        const member = await CommunityMember.findOneAndDelete({ _id: memberId });
        if (!member) {
            throw new ApiError('Community member not found for userId', httpStatus.status.NOT_FOUND);
        }

        const posts = await CommunityPost.find({ postedBy: member.userId, communityId: member.communityId });
        const postIds = posts.map(post => post._id);

        await Promise.all([
            CommunityPost.deleteMany({ postedBy: member.userId, communityId: member.communityId }),
            CommunityReport.deleteMany({ postId: { $in: postIds } })
        ]);

        return member;
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
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const members = await CommunityMember.find({ communityId, role: 'moderator' })
            .populate('userId')
            .limit(parseInt(limit))
            .skip(skip);

        const totalMembers = await CommunityMember.countDocuments({ communityId, role: 'moderator' });

        const userIds = members.map(member => member.userId);

        return {
            users: members.map(member => {
                const user = member.userId; // could be null
                return {
                    _id: member._id,
                    userId: user?._id || null,
                    username: user?.username || null,
                    fullName: user?.fullName || null,
                    email: user?.email || null,
                    profilePicture: user?.profilePicture || null,
                    gender: user?.gender || null,
                    status: user?.status || null,
                    createdOn: user?.createdAt || null,
                    lastActive: user?.lastActiveAt || "N/A",
                    totalPosts: user?.postsCount || 0,
                    accountStatus: user?.isDisabled ? "isDisable" : "Enabled",
                    userType: user?.userType || null,
                };
            }),
            totalMembers,
            totalPages: Math.ceil(totalMembers / limit),
            currentPage: parseInt(page)
        } || [];
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.addCommunityMember = async (req, res) => {
    try {
        const { userIds = [] } = req.body;
        const { communityId } = req.params;
        const { type } = req.query;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError('User IDs must be a non-empty array', httpStatus.status.BAD_REQUEST);
        }

        const community = await Community.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }
        if (type !== 'moderator' && type !== 'member' && type !== 'admin') {
            throw new ApiError('Invalid role type', httpStatus.status.BAD_REQUEST);
        }
        if (type === 'admin') {
            const existingAdmin = await CommunityMember.findOneAndDelete({ communityId, role: 'admin' });
            community.adminId = userIds[0];
            const communityMember = new CommunityMember({ userId: userIds[0], communityId, role: type });
            await communityMember.save();
            return await community.save();
        }
        const addedMembers = [];
        for (const userId of userIds) {

            const communityMember = new CommunityMember({ userId, communityId, role: type });
            await communityMember.save();
            addedMembers.push(communityMember);
        }

        return addedMembers;
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
