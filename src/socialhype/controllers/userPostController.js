const ApiError = require("../../../utils/ApiError.js");
const httpStatus = require("http-status");
const SavedPost = require("../models/savedPost.js");

// Get all saved posts for a user
export const getSavedPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const savedPosts = await SavedPost.find({ userId }).populate({
      path: "postId",
      match: { status: { $ne: "deleted" } },
    });

    // Filter out any null postId (i.e., posts that were deleted)
    const posts = savedPosts
      .filter((entry) => entry.postId)
      .map((entry) => entry.postId);
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
  const { userId } = req.params;
  try {
    const taggedPosts = await SavedPost.find({ taggedUserId: userId }).populate(
      {
        path: "postId",
        match: { status: { $ne: "deleted" } }, // exclude deleted posts
      }
    );

    const posts = taggedPosts
      .filter((entry) => entry.postId)
      .map((entry) => entry.postId);
    return posts;
  } catch (err) {
    throw new ApiError(
      `Failed to fetch tagged posts': ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};
