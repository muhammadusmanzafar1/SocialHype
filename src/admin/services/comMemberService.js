const CommunityMember = require('../../socialhype/models/communityMembers');
const Community = require('../../socialhype/models/community');
const CommunityPost = require('../../socialhype/models/communityPost');
const ApiError = require('../../../utils/ApiError');
const User = require('../../auth/models/user');
const httpStatus = require('http-status');
const { log } = require('winston');

exports.getCommunityMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10,  } = req.query;

        const members = await CommunityMember.find({ communityId: id })
            .populate('userId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (!members || members.length === 0) {
            throw new ApiError('No members found for this community', httpStatus.status.NOT_FOUND);
        }
        console.log(members);
        

        const totalMembers = members.length || 0;
        const totalPages = Math.ceil(totalMembers / limit);

        return {
            users: members.map(member => ({
              _id: member._id,
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
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const members = await CommunityMember.find({ communityId, role: 'moderator' })
        .populate('userId')
        .limit(parseInt(limit))
        .skip(skip);

        const totalMembers = members.length || 0;

        const userIds = members.map(member => member.userId);

        return {users: userIds?.map(user => ({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture || null,
            gender: user.gender,
            status: user.status,
            createdOn: user.createdAt,
            lastActive: user.lastActive || "N/A",
            totalPosts: user.postsCount,
            accountStatus: user.isDisable ? "isDisable" : "Enabled",
            userType: user.userType,
        })), 
        totalMembers,
        totalPages: Math.ceil(totalMembers / limit),
        currentPage: parseInt(page)} || [];
    } catch (error) {
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
