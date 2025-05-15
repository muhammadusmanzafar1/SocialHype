const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError');
const adminController = require('../controller/adminController');

//<---- User Management ----->

router.get("/getUserslist", async (req, res) => {

    try {
        const users = await adminController.getUsersList(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Users fetched successfully", users });

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
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "User details fetched successfully", userDetails });
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
        res.status(httpStatus.status.CREATED).json({ isSuccess: true, message: "User added successfully", user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put("/updateUser/:userId", async (req, res) => {
    try {
        const user = await adminController.updateUser(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "User updated successfully", user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.patch("/changeUserStatus/:userId", async (req, res) => {
    try {
        const user = await adminController.updateUserStatus(req, res);
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
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "User deleted successfully", user });
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


//  <---- Post Management ----->

router.get("/getAllPosts", async (req, res) => {
    try {
        const posts = await adminController.getAllPosts(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Posts fetched successfully", posts });
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
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Post deleted successfully", post });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put("/disablePost/:postId", async (req, res) => {
    try {
        const post = await adminController.disablePost(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Post status updated successfully", post });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// <---- Report Management ----->

router.get("/getAllReports", async (req, res) => {
    try {
        const reports = await adminController.getAllReports(req, res);
        res.status(httpStatus.status.OK).json({ isSuccess: true, message: "Reports fetched successfully", reports });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;