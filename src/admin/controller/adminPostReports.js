const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const CommunityPostReport = require('../../socialhype/models/communityReport');
const CommentReport = require('../../socialhype/models/commentReport');
const CommunityPost = require('../../socialhype/models/communityPost');

exports.getAllPostReport = async (postId) => {
    try {
        const reports = await CommunityPostReport.find({ postId })
            .populate({ path: 'postId', select: 'title content' })
            .populate({ path: 'reportedBy', select: 'name email profilePicture' })
            .sort({ createdAt: -1 })
            .lean(); 
        return reports;
    } catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while fetching post reports',
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
        );
    }
} 

exports.getAllCommunityPostReport = async (req) => {
    const { communityId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const skip = (page - 1) * limit;

        const posts = await CommunityPost.find({
            communityId,
            reports: { $exists: true, $not: { $size: 0 } }
        })
            .populate('postedBy', 'fullName username email profilePicture')
            .populate('reports')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithReportCount = posts.map(post => ({
            ...post,
            reportCount: post.reports.length
        }));

        const totalCount = await CommunityPost.countDocuments({
            communityId,
            reports: { $exists: true, $not: { $size: 0 } }
        });

        return {
            posts: postsWithReportCount,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalPosts: totalCount,
            }
        };

    } catch (error) {
        throw new ApiError(
            error.message || 'Error fetching reported community posts',
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
        );
    }
};


exports.getAllCommentReport = async (commentId) => {
    try {
        const reports = await CommentReport.find({ commentId })
            .populate({ path: 'commentId', select: 'content' })
            .populate({ path: 'postId', select: 'title content' })
            .populate({ path: 'reportedBy', select: 'name email profilePicture' })
            .sort({ createdAt: -1 })
            .lean();
        return reports;
    }
    catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while fetching comment reports',
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
        );
    }
}

// mark a report as resolved
exports.markReportAsResolved = async (reportId) => {
    try {
        const report = await CommunityPostReport.findByIdAndUpdate(
            reportId,
            { status: 'resolved' },
            { new: true }
        ).lean();

        if (!report) {
            throw new ApiError('Report not found', httpStatus.status.NOT_FOUND);
        }

        return report;
    } catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while marking the report as resolved',
            error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR
        );
    }
}

exports.deleteReport = async (reportId) => {
    try {
        const report = await CommunityPostReport.findByIdAndDelete(reportId).lean();

        if (!report) {
            throw new ApiError('Report not found', httpStatus.status.NOT_FOUND);
        }

        return report;
    } catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while deleting the report',
            error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR
        );
    }
}