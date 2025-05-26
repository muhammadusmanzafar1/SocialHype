const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const UserCommunity = require('../models/community');
const CommunityMember = require('../models/communityMembers');
const CommunityPost = require('../models/communityPost');
const cloudinary = require('../../../utils/cloudinary');

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
        const body = req.body;
        const { avatarUrl, bannerUrl } = body;


        let avatarImageUrl = '';
        let bannerImageUrl = '';

        if (avatarUrl) {
            const uploadImgavatar = await cloudinary.uploader.upload(avatarUrl);
            avatarImageUrl = uploadImgavatar.url;
        }
        if (bannerUrl) {
            const uploadImgbanner = await cloudinary.uploader.upload(bannerUrl);
            bannerImageUrl = uploadImgbanner.url;
        }

        const model = await UserCommunity.newEntity(avatarImageUrl, bannerImageUrl, body);
        const newCommunity = new UserCommunity(model);

        newCommunity.adminId = userId;
        const communityMembers = new CommunityMember({
            communityId: newCommunity._id,
            userId: userId,
            role: 'admin',
            isDisabled: false,
        });
        const member = await communityMembers.save();
        if (!member) {
            throw new ApiError("Failed to create community member", httpStatus.status.INTERNAL_SERVER_ERROR);
        }

        return await newCommunity.save();
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

        const communityMembers = await CommunityMember.find({ communityId })
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
        Object.keys(body).forEach((key) => {
            if (body[key] !== undefined) {
                community[key] = body[key];
            }
        });
        if (body.avatarUrl) {
            const uploadImg = await cloudinary.uploader.upload(body.avatarUrl);
            community.avatarUrl = uploadImg.url;
        }
        if (body.bannerUrl) {
            const uploadImg = await cloudinary.uploader.upload(body.bannerUrl);
            community.bannerUrl = uploadImg.url;
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
        const members = await CommunityMember.find({ communityId })
            .populate('userId', 'name email profilePicture')
            .select('userId role isDisabled joinedAt lastActiveAt');
        if (!members || members.length === 0) {
            throw new ApiError('No members found in this community', httpStatus.status.NOT_FOUND);
        }
        return members
            .filter(member => member.userId !== null)
            .map(member => ({
                userDetail: {
                    userId: member.userId._id,
                    name: member.userId.fullName || member.userId.username || '',
                    email: member.userId.email,
                    profilePicture: member.userId.profilePicture || ''
                },
                role: member.role,
                isDisabled: member.isDisabled,
                joinedAt: member.joinedAt,
                lastActiveAt: member.lastActiveAt
            }));
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