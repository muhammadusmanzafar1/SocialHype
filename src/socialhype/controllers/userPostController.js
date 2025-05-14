const ApiError = require("../../../utils/ApiError.js");
const httpStatus = require("http-status");
const taggedPost = require("../models/taggedPost.js");
const savedPost = require("../models/savedPost.js");
// Get all saved posts for a user
export const getSavedPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const savedPosts = await savedPost.find({ userId }).populate("postId");
    const posts = savedPosts.map((entry) => entry.postId);
    return posts;
  } catch (err) {
    throw new ApiError(
      `Failed to fetch saved posts: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Get all posts where the user is tagged
export const getTaggedPosts = async (req, res) => {
  const user = req.user._id;
  try {
    const taggedPosts = await taggedPost
      .find({ taggedUserId: user })
      .populate("postId");
    const posts = taggedPosts.map((entry) => entry.postId);
    return posts;
  } catch (err) {
    throw new ApiError(
      `Failed to fetch tagged posts': ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};
