const User = require("../../auth/models/user");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");

exports.getUsersList = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, isEnabled } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (isEnabled !== undefined) filters.isEnabled = isEnabled === 'true';

        const users = await User.find(filters)
            .select("username email gender status createdAt lastActive totalPosts isEnabled")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(filters);

        if (!users || users.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, "No users found");
        }

        return {
            users: users.map(user => ({
                username: user.username,
                email: user.email,
                gender: user.gender,
                status: user.status,
                createdOn: user.createdAt,
                lastActive: user.lastActive,
                totalPosts: user.totalPosts,
                accountStatus: user.isEnabled ? "Enabled" : "Disabled",
            })),
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        throw new ApiError(`Error fetching users: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
        }

        return user;
    } catch (error) {
        throw new ApiError(`Error fetching user detail: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.addUser = async (req, res) => {
    try {
        const body = req.body;

        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            throw new ApiError(httpStatus.status.CONFLICT, "A user with this email already exists");
        }

        const model = await User.newEntity(body);
        const user = new User(model);
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
        const {
            isDisabled
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
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
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
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

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
        }
        await post.remove();
        return post;
    }
    catch (error) {
        throw new ApiError(`Error deleting post: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}
