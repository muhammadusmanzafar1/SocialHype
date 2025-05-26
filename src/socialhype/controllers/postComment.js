const Comment = require("../models/comment");
const CommentReport = require("../models/commentReport");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");


// Create a new comment
exports.createComment = async (req, res) => {
  const body = req.body;
  try {
    const userId = req.user.id;

    const newComment = new Comment({ ...body, userId: userId });
    await newComment.save();
    return newComment;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to create comment: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// like a comment
exports.likeComment = async (req, res) => {
const { commentId } = req.params;
const { status } = req.query;
const userId = req.user.id;
try {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError("Comment not found", httpStatus.status.NOT_FOUND);
  }

  if (status === "like") {
    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
    }
  } else if (status === "unlike") {
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
  } else {
    throw new ApiError("Invalid status value", httpStatus.status.BAD_REQUEST);
  }

  await comment.save();
  return comment;
} catch (err) {
  if (err instanceof ApiError) {
    throw err;
  }
  throw new ApiError(
    `Failed to update like status on comment: ${err.message}`,
    httpStatus.status.INTERNAL_SERVER_ERROR
  );
}
}

// reply to a comment
exports.replyComment = async (req, res) => {
  const { commentId } = req.params;
  const body = req.body;
  const userId = req.user.id;

  try {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $push: {
        replies: {
          userId: userId,
          text: body.text,
        },
      },
    }, { new: true });
    if (!comment) {
      throw new ApiError("Comment not found", httpStatus.status.NOT_FOUND);
    }
    return comment;
  }
  catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to reply to comment: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

// report a comment
exports.reportComment = async (req, res) => {
  const { commentId } = req.params;
  const body = req.body;
  const userId = req.user.id;

  try {
    const commentReport = new CommentReport({
      commentId: commentId,
      userId: userId,
      reason: body.reason,
    });
    await commentReport.save();
    return commentReport;
  } catch (err) {
    throw new ApiError(
      `Failed to report comment: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

// get a comment
exports.getCommentById = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError("Comment not found", httpStatus.status.NOT_FOUND);
    }
    return comment;
  }
  catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to get comment: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

// delete a comment
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      throw new ApiError("Comment not found", httpStatus.status.NOT_FOUND);
    }
    return comment;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to delete comment: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

//delete a reply
exports.deleteReply = async (req, res) => {
  const { commentId, replyId } = req.params;

  try {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $pull: {
        replies: {
          _id: replyId,
        },
      },
    }, { new: true });
    if (!comment) {
      throw new ApiError("Comment not found", httpStatus.status.NOT_FOUND);
    }
    return comment;
  }
  catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to delete reply: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

// like a reply
exports.likeStatusOnReply = async (req, res) => {
  const { commentId, replyId } = req.params;
  const { status } = req.query;
  const userId = req.user.id;

  try {
    let updateQuery;

    if (status === "like") {
      updateQuery = {
        $addToSet: {
          "replies.$.likes": userId,
        },
      };
    } else if (status === "unlike") {
      updateQuery = {
        $pull: {
          "replies.$.likes": userId,
        },
      };
    } else {
      throw new ApiError("Invalid status value", httpStatus.status.BAD_REQUEST);
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, "replies._id": replyId },
      updateQuery,
      { new: true }
    );

    if (!comment) {
      throw new ApiError("Comment or reply not found", httpStatus.status.NOT_FOUND);
    }

    return comment;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to update reply like status: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}
