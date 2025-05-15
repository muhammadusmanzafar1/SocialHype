const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError');

const adminDashboard = require('../controller/adminDashController');

router.get('/metrics', async (req, res) => {
    try {
        const metrics = await adminDashboard.getMetrics(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Metrics fetched successfully", metrics });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/users/statics', async (req, res) => {
    try {
        const userStats = await adminDashboard.getUserStatics(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Metrics fetched successfully", userStats });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/trafficByUser', async (req, res) => {
    try {
        const trafficByUser = await adminDashboard.getTrafficByUser(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Metrics fetched successfully", trafficByUser });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/topCountries', async (req, res) => {
    try {
        const topCountries = await adminDashboard.getTopCountries(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Metrics fetched successfully", topCountries });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;