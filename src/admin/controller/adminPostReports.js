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

exports.getAllCommunityPostReport = async (req) => {
    const { communityId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const skip = (page - 1) * limit;

        let reports = await CommunityPostReport.find({ communityId })
            .populate({ 
                path: 'postId', 
                select: '-communityId', 
                populate: { path: 'postedBy', select: 'fullName username email profilePicture' } 
            })
            .populate({ path: 'reportedBy', select: 'fullName username email profilePicture' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        reports = reports.filter(report => report.postId !== null);

        const totalReports = await CommunityPostReport.countDocuments({ communityId });

        return {
            reports,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReports / limit),
                totalReports,
            }
        };

    } catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while fetching post reports',
            error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR
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