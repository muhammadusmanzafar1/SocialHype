const ApiError = require("../../../utils/ApiError.js");
const httpStatus = require("http-status");
const SavedPost = require("../models/savedPost.js");
const TaggedPost = require("../models/taggedPost.js");
const PostReport = require("../models/postReport.js");
const Comment = require("../models/comment.js");
const Post = require("../models/userPost.js");
const cloudinary = require("../../../utils/cloudinaryUpload.js");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = { ...req.body };

    body.media = Array.isArray(body.media) ? body.media : [];

    if (req.files?.media?.length > 0) {
      const uploadResult = await cloudinary(req.files.media[0].buffer);
      if (uploadResult?.secure_url) {
        body.media.push(uploadResult.secure_url);
      }
    }

    const newPost = new Post({
      ...body,
      author: userId,
    });

    await newPost.save();
    return newPost;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to create post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const totalPosts = await Post.countDocuments({ author: userId, status: { $ne: "deleted" } });
    const posts = await Post.find({ author: userId, status: { $ne: "deleted" } })
      .populate("author", "fullName username email profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    if (!posts || posts.length === 0) {
      throw new ApiError("No posts found", httpStatus.status.NOT_FOUND);
    }

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to fetch posts: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Get post details by ID
exports.getPostDetail = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate("author");
    if (!post) {
      throw new ApiError(
        "Post not found",
        httpStatus.status.NOT_FOUND
      );
    }
    return post;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to fetch post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Update a post by ID
exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const body = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { ...body },
      { new: true, runValidators: true }
    ).populate("author");
    if (!updatedPost) {
      throw new ApiError(
        "Post not found",
        httpStatus.status.NOT_FOUND
      );
    }
    return updatedPost;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to update post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Delete a post by ID
exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      throw new ApiError("Post not found", httpStatus.status.NOT_FOUND);
    }
    await Promise.all([
      SavedPost.deleteMany({ postId }),
      TaggedPost.deleteMany({ postId }),
      PostReport.deleteMany({ postId }),
    ]);

    return deletedPost;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to delete post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Vote on a post
exports.votePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(postId, {
      $inc: { votes: 1 },
    }, { new: true });
    if (!post) {
      throw new ApiError("Post not found", httpStatus.status.NOT_FOUND);
    }
    return post;
  }
  catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to vote on post: ${err.message}`,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

//save a post
exports.savePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  try {
    const savedPost = new SavedPost({ postId, userId });
    await savedPost.save();
    return savedPost;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to save post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Share a post
exports.sharePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  try {
    const sharedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        $addToSet: { sharedBy: userId },
        $inc: { shareCount: 1 }
      },
      { new: true }
    );
    if (!sharedPost) {
      throw new ApiError("Post not found", httpStatus.status.NOT_FOUND);
    }
    return sharedPost;
  }
  catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to share post: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Get all comments for a post
exports.getAllPostsComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Comment.find({postId})
    if (!post) {
      throw new ApiError("Comments not found for the post", httpStatus.status.NOT_FOUND);
    }
    return post.comments;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to fetch comments: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Get all saved posts for a user
exports.getSavedPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const savedPosts = await SavedPost.find({ userId }).populate("postId");

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
exports.getTaggedPosts = async (req, res) => {
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
