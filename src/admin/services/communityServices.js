const community = require("../../socialhype/models/community");
const communityMember = require("../../socialhype/models/communityMembers");
const communityPost = require("../../socialhype/models/communityPost");
const user = require("../../auth/models/user");
const ApiError = require("../../../utils/ApiError");
const uploadToCloudinary = require('../../../utils/cloudinaryUpload');
const httpStatus = require("http-status");

exports.getAllCommunities = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", type } = req.query;
    
        const query = {
          name: { $regex: search, $options: "i" },
          status: { $ne: "deleted" },
        };
    
        if (type && type !== "all") {
          query.type = type;
        }
    
        const communities = await community
          .find(query)
          .populate("adminId", "name email profilePicture fullName")
          .select("-__v")
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
    
        const communityIds = communities.map(c => c._id);
    
        const memberCounts = await communityMember.aggregate([
          { $match: { communityId: { $in: communityIds } } },
          { $group: { _id: "$communityId", count: { $sum: 1 } } },
        ]);
    
        const memberCountMap = {};
        memberCounts.forEach(mc => {
          memberCountMap[mc._id.toString()] = mc.count;
        });
    
        const communitiesWithMemberCount = communities.map(c => {
          const cObj = c.toObject();
          cObj.memberCount = memberCountMap[c._id.toString()] || 0;
          return cObj;
        });
    
        const total = await community.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
    
        return {
          data: communitiesWithMemberCount,
          total,
          totalPages,
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
            .populate("adminId", "fullName username name email profilePicture")
            .select("-__v");

        if (!communityData) {
            throw new ApiError("Community not found", httpStatus.status.NOT_FOUND);
        }

        const [memberCount, postCount, moderatorCount] = await Promise.all([
            communityMember.countDocuments({ communityId: id }),
            communityPost.countDocuments({ communityId: id }),
            communityMember.countDocuments({ communityId: id, role: "moderator" }),
        ]);

        const communityWithCounts = {
            ...communityData.toObject(),
            memberCount: memberCount || 0,
            postCount: postCount || 0,
            moderatorCount: moderatorCount || 0,
        };

        return communityWithCounts;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError("Error fetching community: ", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.createCommunity = async (req, res) => {
    try {
        const {adminId, moderators = [], members = [], ...body} = req.body;
        console.log("Creating community with body: ", req.body);
        

        const existingCommunity = await community.findOne({ name: body.name });
        
        if (existingCommunity) {
            throw new ApiError("Community with this name already exists", httpStatus.status.BAD_REQUEST);
        }
        
        const admin = await user.findById(adminId);
        if (admin && admin.status === "deleted") {
            throw new ApiError("Admin account is deleted", httpStatus.status.BAD_REQUEST);
        }
        let avatarImageUrl = '';
        let bannerImageUrl = '';
        if (req.files?.avatar?.[0]) {
            const uploadAvatar = await uploadToCloudinary(req.files.avatar[0].buffer);
            avatarImageUrl = uploadAvatar.secure_url;
          }
      
          if (req.files?.banner?.[0]) {
            const uploadBanner = await uploadToCloudinary(req.files.banner[0].buffer);
            bannerImageUrl = uploadBanner.secure_url;
          }

        const model = await community.newEntity(avatarImageUrl, bannerImageUrl, body, {createdByAdmin: true});
        const newCommunity = new community(model);
        if (admin) {
            newCommunity.adminId = admin._id;
        }
        
        const moderatorSet = new Set(moderators);
        const memberSet = new Set(members);

        moderatorSet.delete(adminId);
        memberSet.delete(adminId);

        for (let modId of moderatorSet) {
            memberSet.delete(modId);
        }

        const createAdmin = new communityMember({
            userId: adminId,
            communityId: newCommunity._id,
            role: "admin",
        });
        await createAdmin.save();

        const membersList = Array.from(memberSet).map(userId => ({
            userId,
            communityId: newCommunity._id,
            role: "member",
        }));

        const moderatorsList = Array.from(moderatorSet).map(userId => ({
            userId,
            communityId: newCommunity._id,
            role: "moderator",
        }));
        if (membersList.length > 0) {
            await communityMember.insertMany(membersList);
            newCommunity.totalMembers += membersList.length;
        }
        if (moderatorsList.length > 0) {
            await communityMember.insertMany(moderatorsList);
            newCommunity.totalMembers += moderatorsList.length;
        }

        const savedCommunity = await newCommunity.save();

        return {savedCommunity, membersList, moderatorsList};
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
        const { ids } = req.body; 
        const { status } = req.query;

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new ApiError("Invalid or empty IDs array", httpStatus.status.BAD_REQUEST);
        }

        if (!["active", "inactive", "disabled", "deleted"].includes(status)) {
            throw new ApiError("Invalid status", httpStatus.status.BAD_REQUEST);
        }

        const communities = await community.find({ _id: { $in: ids } });

        if (communities.length !== ids.length) {
            throw new ApiError("Some communities not found", httpStatus.status.NOT_FOUND);
        }

        for (const updatedCommunity of communities) {
            if (status !== "deleted" && updatedCommunity.status === "deleted") {
                throw new ApiError(
                    `Cannot change status of a deleted community (ID: ${updatedCommunity._id})`,
                    httpStatus.status.BAD_REQUEST
                );
            }
            updatedCommunity.status = status;
        }

        await Promise.all(communities.map(c => c.save()));

        return communities;
    } catch (error) {
        throw error instanceof ApiError
            ? error
            : new ApiError("Error updating community statuses", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};