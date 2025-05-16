const community = require("../../socialhype/models/community");
const user = require("../../auth/models/user");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");

exports.getAllCommunities = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", type } = req.query;

        const query = {
            name: { $regex: search, $options: "i" }, 
        };

        if (type) {
            query.type = type; 
        }

        const communities = await community
            .find(query)
            .populate("adminId", "name email")
            .select("-__v")
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await community.countDocuments(query); 

        return {
            data: {communities},
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        };
    } catch (error) {
        throw new ApiError("Error fetching communities: ", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;

        const communityData = await community
            .findById(id)
            .populate("adminId", "name email")
            .select("-__v");

        if (!communityData) {
            throw new ApiError("Community not found", httpStatus.status.NOT_FOUND);
        }

        return communityData;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError("Error fetching community: ", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.createCommunity = async (req, res) => {
    try {
        const body = req.body;

        const existingCommunity = await community.findOne({ name: body.name });
        
        if (existingCommunity) {
            throw new ApiError("Community with this name already exists", httpStatus.status.BAD_REQUEST);
        }
        
        const admin = await user.findById(body.adminId);
        if (admin && admin.status === "deleted") {
            throw new ApiError("Admin account is deleted", httpStatus.status.BAD_REQUEST);
        }

        const model = await community.newEntity(body);
        const newCommunity = new community(model);
        const savedCommunity = await newCommunity.save();

        return savedCommunity;
    } catch (error) {
        console.error("Error creating community: ", error);
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError("Error creating community: ", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const existingCommunity = await community.findOne({ name: body.name });

        if (existingCommunity && existingCommunity._id.toString() !== id) {
            throw new ApiError("Community with this name already exists", httpStatus.BAD_REQUEST);
        }

        const updatedCommunity = await community.findByIdAndUpdate(id, body, { new: true });

        if (!updatedCommunity) {
            throw new ApiError("Community not found", httpStatus.status.NOT_FOUND);
        }

        return updatedCommunity;
    } catch (error) {
        throw error instanceof ApiError
            ? error
            : new ApiError("Error updating community", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

exports.updateCommunityStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.query.status;

        const updatedCommunity = await community.findById(id);
        if (!updatedCommunity) {
            throw new ApiError("Community not found", httpStatus.status.NOT_FOUND);
        }
        switch (status) {
            case "active":
                if (updatedCommunity.status === "deleted") {
                    throw new ApiError("Cannot reactivate a deleted community", httpStatus.status.BAD_REQUEST);
                }
                updatedCommunity.status = "active";
                break;
            case "inactive":
                if (updatedCommunity.status === "deleted") {
                    throw new ApiError("Cannot deactivate a deleted community", httpStatus.status.BAD_REQUEST);
                }
                updatedCommunity.status = "inactive";
                break;
            case "disabled":
                if (updatedCommunity.status === "deleted") {
                    throw new ApiError("Cannot disable a deleted community", httpStatus.status.BAD_REQUEST);
                }
                updatedCommunity.status = "disabled";
                break;
            case "deleted":
                updatedCommunity.status = "deleted";
                break;
            default:
                throw new ApiError("Invalid status", httpStatus.status.BAD_REQUEST);
        }
        
        await updatedCommunity.save();

        return updatedCommunity;
    } catch (error) {
        throw error instanceof ApiError
            ? error
            : new ApiError("Error updating community status", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};