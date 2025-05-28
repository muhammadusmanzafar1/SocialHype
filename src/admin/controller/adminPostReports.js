const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const CommunityPostReport = require('../../socialhype/models/communityReport');
const CommentReport = require('../../socialhype/models/commentReport');

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

exports.getAllCommunityPostReport = async (communityId) => {
    try {
        const reports = await CommunityPostReport.find({ communityId })
            .populate({ path: 'postId', select: '-communityId -reportCount ' })
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