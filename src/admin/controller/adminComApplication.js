const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const CommunitiesApplication = require('../../socialhype/models/community');

exports.getAllComApplication = async (req) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [applications, totalApplications] = await Promise.all([
            CommunitiesApplication.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate("adminId", "fullName username profilePicture")
            .skip(skip)
            .limit(parseInt(limit)),
            CommunitiesApplication.countDocuments({ status: 'pending' })
        ]);

        if (!applications || applications.length === 0) {
            throw new ApiError('No community applications found', httpStatus.status.NOT_FOUND);
        }

        return {
            applications,
            totalApplications,
            totalPages: Math.ceil(totalApplications / limit),
            currentPage: parseInt(page),
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.applicationStatus = async (applicationId, status) => {
    try {
        if (!applicationId || !status) {
            throw new ApiError('Application ID and status are required', httpStatus.status.BAD_REQUEST);
        }

        const validStatuses = ['active', 'rejected', 'pending'];
        if (!validStatuses.includes(status)) {
            throw new ApiError('Invalid status value', httpStatus.status.BAD_REQUEST);
        }

        const application = await CommunitiesApplication.findById(applicationId);
        if (!application) {
            throw new ApiError('Community application not found', httpStatus.status.NOT_FOUND);
        }

        if (application.status === status) {
            throw new ApiError('Application already has the specified status', httpStatus.status.BAD_REQUEST);
        }

        if (status === 'active') {
            application.status = 'active';
            await application.save();
            return application;
        } else if (status === 'rejected') {
            await CommunitiesApplication.findByIdAndDelete(applicationId);
            return { message: 'Community application has been rejected and deleted' };
        }

        application.status = status;
        await application.save();

        return application;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}