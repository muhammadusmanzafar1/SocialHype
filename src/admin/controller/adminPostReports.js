const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const CommunityPostReport = require('../../socialhype/models/communityReport');

exports.getAllPostReport = async (postId) => {
    try {
        const reports = await CommunityPostReport.find({ postId })
            .populate({ path: 'postId', select: 'title content' })
            .populate({ path: 'reportedBy', select: 'name email' })
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance if no mongoose methods are needed on the result
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
            .populate({ path: 'postId', select: 'title content' })
            .populate({ path: 'reportedBy', select: 'name email' })
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance if no mongoose methods are needed on the result
        return reports;
    } catch (error) {
        throw new ApiError(
            error.message || 'An error occurred while fetching post reports',
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
        );
    }
}