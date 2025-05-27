const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; 
        const notifications = await notification.find({ userId }).sort({ createdAt: -1 });

        if (!notifications || notifications.length === 0) {
            throw new ApiError('No notifications found', httpStatus.status.NOT_FOUND);
        }

        return notifications;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError(`Something went wrong! ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const updatedNotification = await notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        if (!updatedNotification) {
            throw new ApiError('Notification not found', httpStatus.status.NOT_FOUND);
        }
        return updatedNotification;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError(`Something went wrong! ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}