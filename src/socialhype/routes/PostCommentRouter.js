const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require("../../../utils/ApiError");

const postCommentController = require("../controllers/postComment.js");

// Create a new comment
router.post("/createComment", async (req, res) => {
  try {
    const comment = await postCommentController.createComment(req, res);
    res.status(httpStatus.status.CREATED).json({
      isSuccess: true,
      message: "Comment Created Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Creating Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch('/likeComment/:commentId', async (req, res) => {
  try {
    const comment = await postCommentController.likeComment(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Comment Liked Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Liking Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.post('/replyComment/:commentId', async (req, res) => {
  try {
    const comment = await postCommentController.replyComment(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Comment Replied Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Replying Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.post('/reportComment/:commentId', async (req, res) => {
  try {
    const comment = await postCommentController.reportComment(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Comment Reported Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Reporting Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.get('/getCommentById/:commentId', async (req, res) => {
  try {
    const comment = await postCommentController.getCommentById(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Comment Fetched Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Fetching Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.delete('/deleteComment/:commentId', async (req, res) => {
  try {
    const comment = await postCommentController.deleteComment(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Comment Deleted Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Deleting Comment: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.delete('/deleteReply/:commentId/:replyId', async (req, res) => {
  try {
    const comment = await postCommentController.deleteReply(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Reply Deleted Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Deleting Reply: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch('/likeStatusOnReply/:commentId/:replyId', async (req, res) => {
  try {
    const comment = await postCommentController.likeStatusOnReply(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Reply Liked Successfully!",
      comment,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(`Error Liking Reply: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});


module.exports = router;