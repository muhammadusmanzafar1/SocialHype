const User = require("../../auth/models/user");
const Post = require("../../socialhype/models/userPost");
const PostReport = require("../../socialhype/models/postReport");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");
const userService = require("../../auth/services/users");
const { log } = require("winston");

// <---- User Management Service ----->

exports.getUsersList = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", userType = "all" } = req.query;

        const filters = { status: { $ne: "deleted" } };
        if (search) {
            filters.username = { $regex: search, $options: "i" };
        }

        if (userType !== "all") {
            filters.userType = userType;
        }

        const users = await User.find(filters)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(filters);

        if (!users || users.length === 0) {
            throw new ApiError("No users found", httpStatus.status.NOT_FOUND);
        }

        return {
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture || null,
                gender: user.gender,
                status: user.status,
                createdOn: user.createdAt,
                lastActive: user.lastActive || "N/A",
                totalPosts: user.postsCount,
                accountStatus: user.isDisable ? "isDisable" : "Enabled",
                userType: user.userType,
            })),
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error fetching users: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password -__v")
            // .populate("joinedCommunity", "name description")
            // .populate("accountReports", "username email")
            // .populate("postReports", "title content")
            // .populate("userPlan", "planName planDetails");

        if (!user) {
            throw new ApiError("User not found", httpStatus.status.NOT_FOUND);
        }

        return user;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error fetching user detail: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.addUser = async (req, res) => {
    try {
        const body = req.body;

        const existingUser = await userService.get({ email: body.email });
        const existingPhone = await userService.get({ phone: body.phone });
        if (existingUser || existingPhone) {
            throw new ApiError("A user with this email or phone already exists", httpStatus.status.CONFLICT);
        }

        const model = await User.newEntity(body);
        const user = new User(model);
        user.isEmailVerified = true;
        user.isPhoneVerified = true;
        user.status = "active";
        user.activationCode = null;
        await user.save();

        return user;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error adding user: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const body = req.body;

        const existingUser = await userService.get({ email: body.email });
        const existingPhone = await userService.get({ phone: body.phone });

        console.log(existingUser, existingPhone, userId);
        

        if ((existingUser && existingUser._id.toString() !== userId) || (existingPhone && existingPhone._id.toString() !== userId)) {
            throw new ApiError("Email or phone number already exists", httpStatus.status.CONFLICT);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, body, { new: true });
        if (!updatedUser) {
            throw new ApiError("User not found", httpStatus.status.NOT_FOUND);
        }
        return updatedUser;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error updating user: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const status = req.query.status;

        if (!Array.isArray(userId) || userId.length === 0) {
            throw new ApiError("User ID list is empty or not an array", httpStatus.status.BAD_REQUEST);
        }

        let result = [];
        for (const id of userId) {
            const user = await User.findById(id);
            if (!user) {
                throw new ApiError("User not found", httpStatus.status.NOT_FOUND);
            }

            switch (status) {
                case "active":
                    if (user.status === "deleted") {
                        throw new ApiError("User is deleted", httpStatus.status.BAD_REQUEST);
                    }
                    user.status = "active";
                    break;
                case "deleted":
                    user.status = "deleted";
                    break;
                case "disabled":
                    if (user.status === "deleted") {
                        throw new ApiError("User is deleted", httpStatus.status.BAD_REQUEST);
                    }
                    user.status = "disabled";
                    break;
                case "blocked":
                    if (user.status === "deleted") {
                        throw new ApiError("User is deleted", httpStatus.status.BAD_REQUEST);
                    }
                    user.status = "blocked";
                    break;
                default:
                    throw new ApiError("Invalid status", httpStatus.status.BAD_REQUEST);
            }

            await user.save();
            result.push({ id, status: "Updated Successfully" });
        }

        return { data: result };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error updating user: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "User not found");
        }
        user.status = "deleted";
        await user.save();

        return user;

    } catch (error) {
        throw new ApiError(`Error deleting user: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}
// <--------------------- Need a discussion on this --------------------->
// This function is not used in the current code. It is commented out in the router file.
// exports.getActivityLog = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         const user = await User.findById(userId);
//         if (!user) {
//             throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//         }
//         const activityLog = user.activityLog.map(log => ({
//             action: log.action,
//             timestamp: log.timestamp,
//         }));
//         return activityLog;
//     }
//     catch (error) {
//         throw new ApiError(`Error fetching activity log: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
//     }
// }

// <---- Post Management Service ----->

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError( "No posts found", httpStatus.status.NOT_FOUND);
        }
        await post.remove();
        return post;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error deleting post: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.disablePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError( "No posts found", httpStatus.status.NOT_FOUND);
        }
        post.isDisabled = true;
        await post.save();
        return post;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error updating post status: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const posts = await Post.find({author: userId})
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
            if (!posts || posts.length === 0) {
                throw new ApiError( "No posts found", httpStatus.status.NOT_FOUND);
            }
        const totalPosts = await Post.countDocuments();

        return {
            posts,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error fetching posts: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

// <---- Report Management Service ----->

exports.getAllReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reports = await PostReport.find({userId: userId})
            // .populate("postedBy", "username email")
            // .populate("post", "title content")
            // .populate("reportedBy", "username email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalReports = await PostReport.countDocuments();

        if (!reports || reports.length === 0) {
            throw new ApiError( "No reports found", httpStatus.status.NOT_FOUND);
        }

        return {
            reports: {
                reports
            },
            totalReports,
            totalPages: Math.ceil(totalReports / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(`Error fetching reports: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}
