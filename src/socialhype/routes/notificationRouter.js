const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const notificationController = require('../controllers/notificationController');

router.get('/getNotifications', async (req, res) => {
    try {
        const notifications = await notificationController.getNotifications(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Notifications fetched successfully",
            notifications,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res
            .status(httpStatus.status.INTERNAL_SERVER_ERROR)
            .json("Something went wrong!");
    }
});

router.patch('/markAsRead/:id', async (req, res) => {
    try {
        const updatedNotification = await notificationController.markAsRead(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Notification marked as read successfully",
            updatedNotification,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                isSuccess: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                },
            });
        }
        return res
            .status(httpStatus.status.INTERNAL_SERVER_ERROR)
            .json("Something went wrong!");
    }
});

module.exports = router;