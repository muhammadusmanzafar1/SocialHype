const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const challengeController = require('../controllers/challengeController');
const challengeValidator = require('../validators/challenge');

router.get('/getAllChallenges', async (req, res,) => {
    // Add logic if the end date is expire dont get the hype
    try {
        const challenges = await challengeController.getAllChallenges(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "All Challenges Fetched Successfully!",
            challenges,
        });
    } catch (e) {
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

router.post('/createChallenge', async (req, res) => {
    const { error, value } = challengeValidator.hypeChallengeSchema.validate(req.body, { abortEarly: false });
    if (error) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                message: "Validation Error",
                errors: error.details.map(err => err.message),
            });
        }
    try {
        const challenge = await challengeController.createChallenge(req, res);
        res.status(httpStatus.status.CREATED).json({
            isSuccess: true,
            message: "Challenge Created Successfully!",
            challenge,
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

router.get('/getChallengeById/:id', async (req, res) => {
    try {
        const challenge = await challengeController.getChallengeById(req, res);
        if (!challenge) {
            return res.status(httpStatus.status.NOT_FOUND).json({
                isSuccess: false,
                message: "Challenge not found",
            });
        }
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Challenge fetched successfully",
            challenge,
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