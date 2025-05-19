const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

exports.getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;
        const posts = await CommunityPost.find({ communityId })
            .populate('postedBy');
        if (!posts || posts.length === 0) {
            throw new ApiError('No posts found for this community', httpStatus.status.NOT_FOUND);
        }
        return posts;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.disableCommunityPost = async (req, res) => {
    try {
        const { postId } = req.body;
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
        const post = await CommunityPost.findByIdAndDelete(postId);
        if (!post) {
            throw new ApiError('Post not found', httpStatus.status.NOT_FOUND);
        }
        return post;
    } catch (error) {
        if (error instanceof ApiError) {
            return error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}