const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const soundController = require('../controllers/soundController');

router.get('/getSounds', async (req, res) => {
    try {
        const soundsList = await soundController.getSounds(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Sounds fetched successfully",
            soundsList
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
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});