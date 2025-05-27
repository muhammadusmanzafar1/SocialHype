const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const commununityApplication = require('../controller/adminComApplication');

router.get('/getAllComApplication', async (req, res) => {
    try {
        const applications = await commununityApplication.getAllComApplication(req);
        res.status(httpStatus.status.OK).json({
            status: true,
            message: 'Community applications fetched successfully',
            data: applications,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                status: false,
                message: error.message,
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: 'Internal server error',
        });
    }
});

router.post('/Application/status', async (req, res) => {
    try {
        const { applicationId } = req.body;
        const { status } = req.query;
        const application = await commununityApplication.applicationStatus(applicationId, status);
        res.status(httpStatus.status.OK).json({
            status: true,
            message: 'Community application approved successfully',
            data: application,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                status: false,
                message: error.message,
            });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: 'Internal server error',
        });
    }
});

module.exports = router;