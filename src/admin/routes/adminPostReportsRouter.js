const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const CommunityPostReport = require('../controller/adminPostReports');

router.get('/getAllPostReports/:postId', async (req, res) => {
    try {
        const applications = await CommunityPostReport.getAllPostReport(req.params.postId);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: 'Community applications fetched successfully',
            data: applications,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                isSuccess: false,
                message: error.message,
            });
        }
        res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
            isSuccess: false,
            message: 'Internal server error',
        });
    }
});

router.get('/getAllCommunityPostReports/:communityId', async (req, res) => {
    try {
        const applications = await CommunityPostReport.getAllCommunityPostReport(req.params.communityId);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: 'Community applications fetched successfully',
            data: applications,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                isSuccess: false,
                message: error.message,
            });
        }
        res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
            isSuccess: false,
            message: 'Internal server error',
        });
    }
});

module.exports = router;