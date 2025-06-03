const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const cloudinary = require('../../../utils/cloudinaryUpload');
const sharp = require('sharp');

const Story = require('../models/userStory');
const follower = require('../models/follower');


exports.createStory = async (req, res) => {
    try {
        const { userId, mediaUrl, mediaType, mentions, tags } = req.body;

        if (!userId) {
            throw new ApiError('User ID is required', httpStatus.status.BAD_REQUEST);
        }

        let finalMediaUrl = mediaUrl;
        let finalMediaType = mediaType;

        if (req.files && req.files.mediaUrl && req.files.mediaUrl.length > 0) {
            const media = await sharp(req.files.mediaUrl[0].buffer).resize(720).toBuffer();
            const uploadResult = await cloudinary(media, 'story');
            finalMediaUrl = uploadResult.secure_url;
            finalMediaType = uploadResult.resource_type;
        }

        if (!finalMediaUrl || !finalMediaType) {
            throw new ApiError('Media upload or media details are missing', httpStatus.status.BAD_REQUEST);
        }

        const story = new Story({
            userId,
            mediaUrl: finalMediaUrl,
            mediaType: finalMediaType,
            mentions: mentions || [],
            tags: tags || []
        });

        await story.save();

        return story;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Server Error', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getStories = async (userId) => {
    try {
        if (!userId) {
            throw new ApiError('User ID is required', httpStatus.status.BAD_REQUEST);
        }

        const stories = await Story.find({ userId }).sort({ createdAt: -1 });

        if (!stories || stories.length === 0) {
            throw new ApiError('No stories found for this user', httpStatus.status.NOT_FOUND);
        }

        return stories;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Server Error', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getAllStories = async (req) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    try {
        const followers = await follower.find({ followerId: userId }).select('userId');
        const stories = await Promise.all(
            followers.map(async (follower) => {
                return await Story.find({ userId: follower.userId })
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit) 
                    .limit(parseInt(limit)); 
            })
        );

        const flattenedStories = stories.flat(); 
        if (!flattenedStories || flattenedStories.length === 0) {
            throw new ApiError('No stories found', httpStatus.status.NOT_FOUND);
        }

        return flattenedStories;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Server Error', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deleteStory = async (storyId) => {
    try {
        if (!storyId) {
            throw new ApiError('Story ID is required', httpStatus.status.BAD_REQUEST);
        }

        const deletedStory = await Story.findByIdAndDelete(storyId);

        if (!deletedStory) {
            throw new ApiError('Story not found', httpStatus.status.NOT_FOUND);
        }

        return deletedStory;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Server Error', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}