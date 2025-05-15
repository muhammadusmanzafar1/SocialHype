const User = require("../../auth/models/user");
const Post = require("../../socialhype/models/userPost");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");
const userService = require("../../auth/services/users");

// <---- User Management Service ----->

exports.getUsersList = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", userType = "all" } = req.query;

        const filters = {};
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

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError("User not found", httpStatus.status.NOT_FOUND);
        }

        return user;
    } catch (error) {
        throw new ApiError(`Error fetching user detail: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.addUser = async (req, res) => {
    try {
        const body = req.body;

        const existingUser = await userService.get({ email: body.email });
        if (existingUser) {
            throw new ApiError("A user with this email already exists", httpStatus.status.CONFLICT);
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
        const { userId } = req.params;
        const {
            isDisabled
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "User not found");
        }
        user.isDisabled = isDisabled;
        await user.save();

        return user;
    } catch (error) {
        throw new ApiError(`Error updating user: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

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
            throw new ApiError(httpStatus.status.NOT_FOUND, "Post not found");
        }
        await post.remove();
        return post;
    }
    catch (error) {
        throw new ApiError(`Error deleting post: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.disablePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { isDisabled } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Post not found");
        }
        post.isDisabled = isDisabled;
        await post.save();
        return post;
    }
    catch (error) {
        throw new ApiError(`Error updating post status: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const posts = await Post.find({userId: userId})
            .select("title content createdAt userId isDisabled")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments();

        if (!posts || posts.length === 0) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "No posts found");
        }

        return {
            posts: posts.map(post => ({
                title: post.title,
                content: post.content,
                createdOn: post.createdAt,
                userId: post.userId,
                isDisabled: post.isDisabled,
            })),
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        throw new ApiError(`Error fetching posts: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

// <---- Report Management Service ----->

exports.getAllReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reports = await Report.find({userId: userId})
            .select("post reportedBy reason details status createdAt reviewedAt")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalReports = await Report.countDocuments();

        if (!reports || reports.length === 0) {
            throw new ApiError( "No reports found", httpStatus.status.NOT_FOUND);
        }

        return {
            reports: reports.map(report => ({
                post: report.post,
                reportedBy: report.reportedBy,
                reason: report.reason,
                details: report.details,
                status: report.status,
                createdOn: report.createdAt,
                reviewedOn: report.reviewedAt,
            })),
            totalReports,
            totalPages: Math.ceil(totalReports / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        throw new ApiError(`Error fetching reports: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}
