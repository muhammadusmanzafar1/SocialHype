const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError');
const upload = require('../../../middlewares/upload');

const adminCommunityController = require('../controller/adminComController');
const {createCommunityValidator, updateCommunityValidator} = require('../validators/communityManagement');

router.get("/getAllCommunities", async (req, res) => {
    try {
        const communities = await adminCommunityController.getAllCommunities(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Communities fetched successfully", communities });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/getCommunityDetails/:communityId', async (req, res) => {
    try {
        const communityDetails = await adminCommunityController.getCommunityDetails(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community details fetched successfully", communityDetails });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get("/getCommunityById/:id", async (req, res) => {
    try {
        const community = await adminCommunityController.getCommunityById(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community fetched successfully", community });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post("/createCommunity", upload.fields([ { name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }, ]), async (req, res) => {
    const { error, value } = createCommunityValidator.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }

    try {
        const community = await adminCommunityController.createCommunity(req, res);
        res.status(httpStatus.status.CREATED).json({ isSuccess: true, message: "Community created successfully", community });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put("/updateCommunity/:id", upload.fields([ { name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }, ]), async (req, res) => {
    const { error, value } = updateCommunityValidator.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const community = await adminCommunityController.updateCommunity(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community updated successfully", community });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put('/updateCommunityStatus', async (req, res) => {
    try {
        const community = await adminCommunityController.updateCommunityStatus(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community status updated successfully", community });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});


module.exports = router;