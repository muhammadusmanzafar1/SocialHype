const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError');
const adminController = require('../controller/adminController');

router.get("/getUserslist", async (req, res) => {

    try { 
        const users = await adminController.getUsersList(req, res);
        res.status(httpStatus.status.OK).json({isSuccess: true, message: "Users fetched successfully", users });

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }

});

router.get("/getUserDetails/:userId", async (req, res) => {
    try {
        const userDetails = await adminController.getUserDetails(req, res);
        res.status(httpStatus.status.OK).json({isSuccess: true, message: "User details fetched successfully", userDetails });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post("/addUser", async (req, res) => {
    try {
        const user = await adminController.addUser(req, res);
        res.status(httpStatus.status.CREATED).json({isSuccess: true, message: "User added successfully", user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.patch("/updateStatus/:userId", async (req, res) => {
    try {
        const user = await adminController.updateUser(req, res);
        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Status updated successfully",
            user 
            });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete("/deleteUser/:userId", async (req, res) => {
    try {
        const user = await adminController.deleteUser(req, res);
        res.status(httpStatus.status.OK).json({isSuccess: true, message: "User deleted successfully", user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete("/deletePost/:postId", async (req, res) => {
    try {
        const post = await adminController.deletePost(req, res);
        res.status(httpStatus.status.OK).json({isSuccess: true, message: "Post deleted successfully", post });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// router.get("/getActivityLog/:userId", async (req, res) => {
//     try {
//         const activityLog = await adminController.getActivityLog(req, res);
//         res.status(httpStatus.status.OK).json({isSuccess: true, message: "Activity log fetched successfully", activityLog });
//     } catch (error) {
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json({ message: error.message });
//         }
//         return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
//     }
// });

module.exports = router;