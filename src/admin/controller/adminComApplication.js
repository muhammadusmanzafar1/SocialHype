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

        return {
            data: applications,
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
        if (!Array.isArray(applicationId) || applicationId.length === 0 || !status) {
            throw new ApiError('Application IDs array and status are required', httpStatus.status.BAD_REQUEST);
        }

        const validStatuses = ['active', 'rejected', 'pending'];
        if (!validStatuses.includes(status)) {
            throw new ApiError('Invalid status value', httpStatus.status.BAD_REQUEST);
        }

        const applications = await CommunitiesApplication.find({ _id: { $in: applicationId } });
        if (!applications || applications.length === 0) {
            throw new ApiError('No community applications found for the provided IDs', httpStatus.status.NOT_FOUND);
        }

        const updatedApplications = [];
        for (const application of applications) {
            if (application.status === status) {
                continue;
            }

            if (status === 'active') {
                application.status = 'active';
                await application.save();
                updatedApplications.push(application);
            } else if (status === 'rejected') {
                await CommunitiesApplication.findByIdAndDelete(application._id);
                updatedApplications.push({ _id: application._id, message: 'Community application has been rejected and deleted' });
            } else {
                application.status = status;
                await application.save();
                updatedApplications.push(application);
            }
        }

        return updatedApplications;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}