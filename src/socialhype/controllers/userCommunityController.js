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
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [communities, total] = await Promise.all([
            CommunityMember.find({ userId })
                .populate("communityId", "name description avatarUrl status")
                .select("communityId isDisabled joinedAt lastActiveAt role")
                .skip(skip)
                .limit(parseInt(limit)),
            CommunityMember.countDocuments({ userId })
        ]);

        if (!communities || communities.length === 0) {
            throw new ApiError('No communities found', httpStatus.status.NOT_FOUND);
        }

        return {
            communities,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        };
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

