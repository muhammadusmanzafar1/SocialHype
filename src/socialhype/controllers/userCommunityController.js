const httpStatus = require('http-status');
const community = require("../../socialhype/models/community");
const ApiError = require('../../../utils/ApiError');
const UserCommunity = require('../models/community');
const CommunityMember = require('../models/communityMembers');
const CommunityPost = require('../models/communityPost');
const uploadToCloudinary = require('../../../utils/cloudinaryUpload');

exports.getAllCommunities = async (req, res) => {
    try {
        const userId = req.user._id;
        const communities = await CommunityMember.find({ userId })
            .populate("communityId", "name description avatarUrl")
            .select("communityId isDisabled joinedAt lastActiveAt role");

        if (!communities || communities.length === 0) {
            throw new ApiError('No communities found', httpStatus.status.NOT_FOUND);
        }

        return communities;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Something went wrong while fetching communities', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.createCommunity = async (req, res) => {
    try {
        const userId = req.user._id;
        let { moderators = [], ...body } = req.body;

        if (typeof moderators === 'string') {
            moderators = [moderators];
        }

        const existingCommunity = await community.findOne({ name: body.name });

        if (existingCommunity) {
            throw new ApiError("Community with this name already exists", httpStatus.status.BAD_REQUEST);
        }

        let avatarImageUrl = '';
        let bannerImageUrl = '';
        if (req.files?.avatar?.[0]) {
            const file = req.files.avatar[0];
            const uploadAvatar = await uploadToCloudinary(file.buffer, file.mimetype);
            avatarImageUrl = uploadAvatar.secure_url;
        }

        if (req.files?.banner?.[0]) {
            const file = req.files.banner[0];
            const uploadBanner = await uploadToCloudinary(file.buffer, file.mimetype);
            bannerImageUrl = uploadBanner.secure_url;
        }

        const model = await UserCommunity.newEntity(avatarImageUrl, bannerImageUrl, body);
        const newCommunity = new UserCommunity(model);

        newCommunity.adminId = userId;
        const communityMembers = new CommunityMember({
            communityId: newCommunity._id,
            userId: userId,
            role: 'admin',
            status: 'active',
            isDisabled: false,
        });
        const member = await communityMembers.save();
        if (!member) {
            throw new ApiError("Failed to create community member", httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        const filteredModerators = Array.isArray(moderators) ? moderators.filter(id => id !== userId) : [];

        if (filteredModerators.length > 0) {
            const moderatorDocs = filteredModerators.map(modId => ({
                communityId: newCommunity._id,
                userId: modId,
                role: 'moderator',
                status: 'active',
                isDisabled: false,
            }));

            await CommunityMember.insertMany(moderatorDocs);
        }

        const savedCommunity = await newCommunity.save();

        return savedCommunity;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while creating the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getCommunityById = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await UserCommunity.findById(communityId)
            .populate('adminId', 'name email profilePicture');

        const communityMembers = await CommunityMember.find({ communityId, status: 'active' })
            .populate('userId');

        if (communityMembers && communityMembers.length > 0) {
            community.members = communityMembers
                .filter(member => member.userId !== null)
                .map(member => ({
                    userId: member.userId._id,
                    name: member.userId.fullName || member.userId.username || '',
                    email: member.userId.email,
                    profilePicture: member.userId.profilePicture || '',
                    role: member.role,
                    status: member.status || '',
                    isDisabled: member.isDisabled,
                    joinedAt: member.joinedAt,
                    lastActiveAt: member.lastActiveAt
                }));

        }


        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }

        return community;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while fetching the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.updateCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const body = req.body;

        const community = await UserCommunity.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }

        if (body.name) {
            const existingCommunity = await UserCommunity.findOne({
                name: body.name,
                _id: { $ne: communityId },
            });

            if (existingCommunity) {
                throw new ApiError("Community with this name already exists", httpStatus.status.BAD_REQUEST);
            }
        }

        Object.keys(body).forEach((key) => {
            if (body[key] !== undefined) {
                community[key] = body[key];
            }
        });
        if (req.files?.avatar?.[0]) {
            const file = req.files.avatar[0];
            const uploadAvatar = await uploadToCloudinary(file.buffer, file.mimetype);
            community.avatarUrl = uploadAvatar.secure_url;
        }

        if (req.files?.banner?.[0]) {
            const file = req.files.banner[0];
            const uploadBanner = await uploadToCloudinary(file.buffer, file.mimetype);
            community.bannerUrl = uploadBanner.secure_url;
        }

        return await community.save();
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while updating the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deleteCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await UserCommunity.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }

        await UserCommunity.deleteOne({ _id: communityId });
        await CommunityMember.deleteMany({ communityId });
        await CommunityPost.deleteMany({ communityId });
        if (community.avatarUrl) {
            await cloudinary.uploader.destroy(community.avatarUrl);
        }

        return community;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while deleting the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.joinCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user._id;

        const community = await UserCommunity.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }
        const existingMember = await CommunityMember.findOne({ communityId, userId });
        if (existingMember) {
            throw new ApiError('You are already a member of this community', httpStatus.status.BAD_REQUEST);
        }
        const newMember = new CommunityMember({
            communityId,
            userId,
            role: 'member',
            isDisabled: false,
        });
        const savedMember = await newMember.save();
        if (!savedMember) {
            throw new ApiError('Failed to join community', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return savedMember;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while joining the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getCommunityMembers = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const members = await CommunityMember.find({ communityId, role: 'member', status: 'active' })
            .populate('userId', 'username fullName profilePicture')
            .select('userId role isDisabled joinedAt lastActiveAt status')
            .skip(skip)
            .limit(parseInt(limit));

        const totalMembers = await CommunityMember.countDocuments({ communityId, role: 'member' });

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

exports.leaveCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user._id;

        const community = await UserCommunity.findById(communityId);
        if (!community) {
            throw new ApiError('Community not found', httpStatus.status.NOT_FOUND);
        }
        const member = await CommunityMember.findOne({ communityId, userId });
        if (!member) {
            throw new ApiError('You are not a member of this community', httpStatus.status.BAD_REQUEST);
        }
        if (member.role === 'admin') {
            throw new ApiError('You cannot leave the community as an admin', httpStatus.status.FORBIDDEN);
        }
        await CommunityMember.deleteOne({ _id: member._id });
        return member;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while leaving the community ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.searchCommunities = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) {
            throw new ApiError('Search query is required', httpStatus.status.BAD_REQUEST);
        }

        const communities = await UserCommunity.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }).select('name description avatarUrl');

        if (!communities || communities.length === 0) {
            throw new ApiError('No communities found matching the search criteria', httpStatus.status.NOT_FOUND);
        }

        return communities;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while searching for communities ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
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
        const { communityId } = req.params

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Something went wrong while rejecting community request ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}