const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const CommunityPost = require('../../socialhype/models/communityPost');
const postReport = require('../../socialhype/models/postReport');

exports.getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const posts = await CommunityPost.find({ communityId, status: 'active' })
            .populate('postedBy', 'username fullName email profilePicture')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalPosts = await CommunityPost.countDocuments({ communityId, status: 'active' });
        return {
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
            }
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.disableCommunityPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await CommunityPost.findById(postId);
        if (!post) {
            throw new ApiError('Post not found', httpStatus.status.NOT_FOUND);
        }
        post.status = 'disabled';
        await post.save();
        return post;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deleteCommunityPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await CommunityPost.findById(postId);
        if (!post) {
            throw new ApiError('Post not found', httpStatus.status.NOT_FOUND);
        }
        await CommunityPost.findByIdAndDelete(postId);
        await postReport.deleteMany({ post: postId });
        return post;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}