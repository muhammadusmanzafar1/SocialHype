const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

const CommunityMember = require('../controller/adminComMemberController')

router.get('/getCommunityMembers/:id', async (req, res) => {
    try {
        const Members = await CommunityMember.getCommunityMember(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Communities fetched successfully", Members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// router.post('/addCommunityMember', async (req, res) => {
//     try {
//         const Members = await CommunityMember.addCommunityMember(req, res);
//         res.status(httpStatus.status.CREATED).json({ isSuccess: true, message: "Communities added successfully", Members });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json({ message: error.message });
//         }
//         return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
//     }
// });

router.patch('/disableCommunityMember/:memberId', async (req, res) => {
    try {
        const Members = await CommunityMember.disableCommunityMember(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Communities disabled successfully", Members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete('/deleteCommunityMember/:memberId', async (req, res) => {
    try {
        const Members = await CommunityMember.deleteCommunityMember(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Communities deleted successfully", Members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete('/deleteCommunityMembers', async (req, res) => {
    try{
        const Members = await CommunityMember.deleteCommunityMembers(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Communities deleted successfully", Members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})

router.get('/getCommunityModerators/:communityId', async (req, res) => {
    try {
        const members = await CommunityMember.getCommunityModerators(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community moderators fetched successfully", members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post('/addCommunityMember/:communityId', async (req, res) => {
    try {
        const members = await CommunityMember.addCommunityMember(req, res);
        res.status(httpStatus.status.CREATED).json({ isSuccess: true, message: "Community moderators added successfully", members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.patch('/changeCommunityModeratorStatus', async (req, res) => {
    try {
        const members = await CommunityMember.changeCommunityModeratorStatus(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Community moderators status updated successfully", members });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;